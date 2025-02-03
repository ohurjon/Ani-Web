// 1. 서버 사용을 위해서 http 모듈을 http 변수에 담는다. (모듈과 변수의 이름은 달라도 된다.)
var http = require("http");
var fs = require("fs");
var url = require("url");
var path = require("path");

var contentType = require("./content-type.json");

// 2. http 모듈로 서버를 생성한다.
//    아래와 같이 작성하면 서버를 생성한 후, 사용자로 부터 http 요청이 들어오면 function 블럭내부의 코드를 실행해서 응답한다.
var server = http.createServer(async function (req, res) {
  var parsedUrl = url.parse(req.url);
  var resource = parsedUrl.pathname;

  createLog(req);

  if (resource.startsWith("/api")) {
    if (resource == "/api/data") {
      if (req.method == "POST") {
        try {
          let json = await getData(req);
          let title = json.title;

          fs.mkdirSync("data/" + title);
          res.writeHead(200, {
            "Content-Type": contentType[".json"],
          });
          return res.end(JSON.stringify(getList()));
        } catch (err) {
          return sendError(res, 500, "500 Internal Server Error : " + err);
        }
      }
    }

    if (resource == "/api/list" && req.method == "GET") {
      res.writeHead(200, {
        "Content-Type": contentType[".json"],
      });
      return res.end(JSON.stringify(getList()));
    }
  }

  if (resource.startsWith("/")) {
    if (resource == "/") resource = "/index.html";
    try {
      res.writeHead(200, {
        "Content-Type": contentType[path.extname(resource)],
      });

      return res.end(await getHTMLData(res, resource));
    } catch (error) {
      return sendError(res, 500, "500 Internal Server Error : " + error);
    }
  }
});
// 3. listen 함수로 8080 포트를 가진 서버를 실행한다. 서버가 실행된 것을 콘솔창에서 확인하기 위해 'Server is running...' 로그를 출력한다
server.listen(8080, function () {
  console.log("Server is running...");
  if (!fs.existsSync("data")) fs.mkdirSync("data");
});

async function getHTMLData(res, resource) {
  try {
    let data = fs.readFileSync("public" + resource, "utf-8");
    return data;
  } catch (err) {
    return sendError(res, 404, "404 Page Not Found");
  }
}

function createLog(req) {
  // 현재 시간
  const time = new Date().toISOString();

  // 클라이언트의 IP 주소
  const ip = req.socket.remoteAddress;

  // 요청된 URL (주소/경로)
  const url = req.url;

  // 접속 정보 (HTTP 메서드와 프로토콜)
  const method = req.method;
  const protocol = req.httpVersion;

  // 로그 출력
  console.log(`[${time}] ${ip} - ${url} - ${method} ${protocol}`);
}

function sendError(res, code, body) {
  res.writeHead(code, { "Content-Type": contentType["default"] });
  return res.end(body);
}

function getList() {
  let list = fs.readdirSync("data", "utf-8");

  var data = [];

  for (const folder of list) {
    data.push({
      title: folder,
    });
  }

  return data;
}

function getData(req) {
  return new Promise(function (resolve, reject) {
    let body = [];
    try {
      req
        .on("data", (chunk) => {
          body.push(chunk);
        })
        .on("end", () => {
          data = Buffer.concat(body).toString();
          json = JSON.parse(data);
          resolve(json);
        });
    } catch (err) {
      reject(err);
    }
  });
}
