fetch("api/animations")
  .then((response) => response.json())
  .then((jsonData) => {
    const dataList = document.getElementById("dataList");
    jsonData.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `${item.title}`;
      dataList.appendChild(li);
    });
  })
  .catch((error) => console.error("Error loading JSON:", error));

document.addEventListener("DOMContentLoaded", () => {
  const addDataConfirmbutton = document.getElementById("addDataConfirmButton");
  const addDataTitleInput = document.getElementById("addDataTitleInput");

  addDataConfirmbutton.addEventListener("click", () => {
    let title = addDataTitleInput.value;
    addData(title);
  });
});

function addData(title) {
  let params = { title: title };
  console.log("버튼이 클릭되었습니다!");
  // document.getElementById("player").textContent = params;

  $.ajax({
    type: "post",
    url: "api/animation",
    traditional: false,
    data: JSON.stringify(params),
    dataType: "json",
    success: function (data) {
      //파일 주고받기가 성공했을 경우. data 변수 안에 값을 담아온다.
      console.log(data);
    },
  });
}
