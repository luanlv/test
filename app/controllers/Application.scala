package controllers

import java.io.{ByteArrayOutputStream, File}

import akka.actor.Props
import akka.util.Timeout
import com.typesafe.jse.Engine.JsExecutionResult
import com.typesafe.jse.{Engine, Node, JavaxEngine, Trireme}
import io.apigee.trireme.core._
import play.api.Play.current
import play.api._
import play.api.libs.concurrent.Akka
import play.api.libs.concurrent.Execution.Implicits._
import play.api.libs.json.{JsArray, Json}
import play.api.mvc._
import play.twirl.api.Html
import ui.HtmlStream

import scala.concurrent.{Future, Promise}

import scala.concurrent.duration._


object Application extends Controller {

  def index = Action {
    Ok(views.html.link())
  }

  def clientSide = Action {
    Ok(views.html.index())
  }

  private def initialData() = Comments.CommentRepository.getComments map { comments =>
    Json.stringify(Json.toJson(comments))
  }

  // with trireme directly
  def serverSide = Action.async {
    initialData flatMap { data =>
      val serverside = Play.getFile("public/javascripts/serverside.js")
      val stdout = new ByteArrayOutputStream()
      val env = new NodeEnvironment()
      val sandbox = new Sandbox()
      sandbox.setStdout(stdout)
      val script = env.createScript("serverside.js", new File(serverside.toURI), Array(data))
      script.setSandbox(sandbox)
      val htmlResult = Promise[Result]()
      script.execute().setListener(new ScriptStatusListener() {
        override def onComplete(script: NodeScript, status: ScriptStatus): Unit = {
          val result = stdout.toString("UTF-8")
          htmlResult.success(Ok(views.html.index(Html(result))))
        }
      })
      htmlResult.future
    }
  }

  def serverSideJavax = serverSideWithJsEngine(JavaxEngine.props())

  // with js-engine
  def serverSideTrireme = serverSideWithJsEngine(Trireme.props())

  // with node
  def serverSideNode = serverSideWithJsEngine(Node.props())

  private def serverSideWithJsEngine(jsEngine: Props) = Action.async { request =>
    import akka.pattern.ask

    val serverside = Play.getFile("public/javascripts/serverside.js")
    implicit val timeout = Timeout(5.seconds)
    val engine = Akka.system.actorOf(jsEngine, s"engine-${request.id}")

    for {
      data <- initialData()
      result <- (engine ? Engine.ExecuteJs(
        source = new File(serverside.toURI),
        args = List(data),
        timeout = timeout.duration
      )).mapTo[JsExecutionResult]
    } yield {
      Ok(views.html.index(Html(new String(result.output.toArray, "UTF-8"))))
    }
  }

  def serverSideStream2 = Action { request =>
    import ui.HtmlStreamImplicits._
    val initData = initialData().map{
      data => views.html.initData(json.toString, "index")
    }

    val prerendererHtmlStream = HtmlStream(initData)
    Ok.chunked(views.stream.main2(prerendererHtmlStream))
  }

  def serverSideStream = Action { request =>
    import ui.HtmlStreamImplicits._
    val initData = initialData().map{
      data => views.html.initData(json.toString, "index")
    }

    val prerendererHtmlStream = HtmlStream(initData)
    Ok.chunked(views.stream.main(prerendererHtmlStream))
  }

  def serverSideStream3 = Action { request =>
    import play.api.libs.concurrent.Promise
    import ui.HtmlStreamImplicits._
    val initData = Future(views.html.initData(json.toString, "dashboard"))
    val delay1 = 3
    val initDataDelay =  Promise.timeout(initData, delay1.second).flatMap(x => x)
    val prerendererHtmlStream = HtmlStream(initDataDelay)
    Ok.chunked(views.stream.main3(prerendererHtmlStream))
  }

  def dashboard = Action { request =>
    import play.api.libs.concurrent.Promise
    import ui.HtmlStreamImplicits._
    val initData = Future(views.html.initData(json.toString, "dashboard"))
    val delay1 = 1
    val initDataDelay =  Promise.timeout(initData, delay1.second).flatMap(x => x)
    val prerendererHtmlStream = HtmlStream(initDataDelay)
    Ok.chunked(views.stream.main(prerendererHtmlStream))
  }


  var json = Json.arr(Json.obj("name" -> "a"), Json.obj("name" -> "b"))

  def getData = Action.async {
    import play.api.libs.concurrent.Promise
    val delay1 = 1
    val jobj = Future(json)
    val fJson =  Promise.timeout(jobj, delay1.second).flatMap(x => x)
    json = json.++(Json.arr(Json.obj("name" -> "c")))
    fJson map {
      data => Ok(data)
    }
  }
}