/* ======================================================
   RMS Renewal Management System
   renewal.js
   V0.1
====================================================== */

/* ======================================================
   Firebase
====================================================== */

firebase.initializeApp({
    databaseURL:"https://sales-dashboard-e7a79-default-rtdb.firebaseio.com"
});

const db = firebase.database();

const ADMIN_PASSWORD = "2330";


/* ======================================================
   센터 목록
====================================================== */

const centers = [
    "서대문",
    "의정부",
    "고양",
    "구리",
    "노원",
    "광진",
    "강릉",
    "원주",
    "춘천"
];


/* ======================================================
   담당M 목록
   ※ 이름은 나중에 실제 담당자로 변경
====================================================== */

const members = [

    { center:"서대문", name:"유승준" },
    { center:"서대문", name:"허만석" },
    { center:"서대문", name:"최성환" },

    { center:"의정부", name:"윤경식" },
    { center:"의정부", name:"김하늘" },
    { center:"의정부", name:"김다성" },
    { center:"의정부", name:"이주영" },
  
    { center:"고양", name:"노민기" },
    { center:"고양", name:"조대형" },
    { center:"고양", name:"김준호" },
    { center:"고양", name:"김세미" },
  
    { center:"구리", name:"이세훈" },
    { center:"구리", name:"박남두" },
    { center:"구리", name:"유소연" },
    { center:"구리", name:"최수정" },
  
    { center:"노원", name:"김태욱" },
    { center:"노원", name:"이율린" },
    { center:"노원", name:"김택민" },

    { center:"광진", name:"최재현" },
    { center:"광진", name:"이경민" },
    { center:"광진", name:"오은지" },

    { center:"강릉", name:"김경환" },
    { center:"강릉", name:"심아롬" },
    { center:"강릉", name:"김경원" },
    { center:"강릉", name:"박수용" },
  
    { center:"원주", name:"이인훈" },
    { center:"원주", name:"서정원" },
    { center:"원주", name:"조민희" },
    { center:"원주", name:"김지훈" },
  
    { center:"춘천", name:"임원일" },
    { center:"춘천", name:"양승환" },
    { center:"춘천", name:"인기돈" }

];


/* ======================================================
   DOM
====================================================== */

const memberBody = document.getElementById("memberBody");

const summaryTable = document.getElementById("summaryTable");

const toast = document.getElementById("toast");

const passwordModal = document.getElementById("passwordModal");

const telegramModal = document.getElementById("telegramModal");

const loading = document.getElementById("loading");


/* ======================================================
   시작
====================================================== */

document.addEventListener("DOMContentLoaded",()=>{

    createMemberTable();

});
/* ======================================================
   담당M 테이블 생성
====================================================== */

function createMemberTable(){

    memberBody.innerHTML = "";

    members.forEach(member=>{

        const row = document.createElement("tr");

        row.innerHTML = `

            <td>${member.center}</td>

            <td>${member.name}</td>

            <td>
                <input
                    type="number"
                    class="renewal"
                    min="0"
                    value="0"
                    inputmode="numeric">
            </td>

            <td>
                <input
                    type="number"
                    class="transfer"
                    min="0"
                    value="0"
                    inputmode="numeric">
            </td>

            <td>
                <input
                    type="number"
                    class="success"
                    min="0"
                    value="0"
                    inputmode="numeric">
            </td>

            <td class="rate">

                0.0%

            </td>

            <td>

                <button class="save-btn">

                    저장

                </button>

            </td>

        `;

        memberBody.appendChild(row);

    });

    bindEvents();

loadFirebase();

}
/* ======================================================
   이벤트 등록
====================================================== */

function bindEvents(){

    const rows = memberBody.querySelectorAll("tr");

    rows.forEach(row=>{

        const renewalInput = row.querySelector(".renewal");
        const transferInput = row.querySelector(".transfer");
        const successInput = row.querySelector(".success");

        const rateCell = row.querySelector(".rate");
        const saveButton = row.querySelector(".save-btn");

        function calculateRate(){

            const renewal = Number(renewalInput.value) || 0;
            const success = Number(successInput.value) || 0;

            let rate = 0;

            if(renewal > 0){

                rate = (success / renewal) * 100;

            }

            rateCell.textContent = rate.toFixed(1) + "%";

        }

        renewalInput.addEventListener("input",calculateRate);
        successInput.addEventListener("input",calculateRate);

    saveButton.addEventListener("click",()=>{

    updateSummary();

    const center = row.cells[0].textContent.trim();
    const name = row.cells[1].textContent.trim();

    const renewal = Number(renewalInput.value) || 0;
    const transfer = Number(transferInput.value) || 0;
    const success = Number(successInput.value) || 0;

   db.ref("renewal/"+center+"/"+name).set({

    renewal: renewal,
    transfer: transfer,
    success: success,
    updatedAt: Date.now()

})
.then(()=>{

    console.log("Firebase 저장 성공");

})
.catch((err)=>{

    console.error("Firebase 저장 실패", err);

});

    showToast();

    saveButton.innerHTML="✅";

    saveButton.style.background="#28a745";

    setTimeout(()=>{

        saveButton.innerHTML="저장";

        saveButton.style.background="";

    },1200);

});
    });

}
/* ======================================================
   센터별 합계 / 전체 합계 계산
====================================================== */

function updateSummary(){

    const summaryRows = summaryTable.querySelectorAll("tbody tr");

    const centerData = {};

    centers.forEach(center=>{

        centerData[center]={
            renewal:0,
            transfer:0,
            success:0
        };

    });

    const memberRows = memberBody.querySelectorAll("tr");

    memberRows.forEach(row=>{

        const center = row.cells[0].textContent.trim();

        const renewal = Number(row.querySelector(".renewal").value)||0;
        const transfer = Number(row.querySelector(".transfer").value)||0;
        const success = Number(row.querySelector(".success").value)||0;

        centerData[center].renewal += renewal;
        centerData[center].transfer += transfer;
        centerData[center].success += success;

    });


    let totalRenewal = 0;
    let totalTransfer = 0;
    let totalSuccess = 0;


    centers.forEach((center,index)=>{

        const row = summaryRows[index];

        const renewal = centerData[center].renewal;
        const transfer = centerData[center].transfer;
        const success = centerData[center].success;

        const rate =
            renewal===0
            ?0
            :(success/renewal)*100;

        row.cells[1].textContent = renewal;
        row.cells[2].textContent = transfer;
        row.cells[3].textContent = success;
        row.cells[4].textContent = rate.toFixed(1)+"%";

        totalRenewal += renewal;
        totalTransfer += transfer;
        totalSuccess += success;

    });


    const totalRate =
        totalRenewal===0
        ?0
        :(totalSuccess/totalRenewal)*100;


    document.getElementById("sumRenewal").textContent = totalRenewal;
    document.getElementById("sumTransfer").textContent = totalTransfer;
    document.getElementById("sumSuccess").textContent = totalSuccess;
    document.getElementById("sumRate").textContent = totalRate.toFixed(1)+"%";
/* ======================================================
   HOME 대시보드 연동
====================================================== */

const dashboardData = {

    renewal: totalRenewal,
    transfer: totalTransfer,
    success: totalSuccess,
    rate: totalRate.toFixed(1)

};

localStorage.setItem(
    "renewalDashboard",
    JSON.stringify(dashboardData)
);
}
/* ======================================================
   Toast
====================================================== */

function showToast(){

    toast.classList.add("show");

    setTimeout(()=>{

        toast.classList.remove("show");

    },1500);

}



/* ======================================================
   관리자 비밀번호
====================================================== */

document
.getElementById("btnReset")
.addEventListener("click",()=>{

    document.getElementById("adminPassword").value="";

    passwordModal.classList.remove("hidden");

});


document
.getElementById("passwordCancel")
.addEventListener("click",()=>{

    passwordModal.classList.add("hidden");

});


document
.getElementById("passwordConfirm")
.addEventListener("click",()=>{

    const pw =
        document.getElementById("adminPassword").value;

    if(pw!==ADMIN_PASSWORD){

        alert("비밀번호가 올바르지 않습니다.");

        return;

    }

    passwordModal.classList.add("hidden");

    resetAllData();

});



/* ======================================================
   전체 초기화
====================================================== */

function resetAllData(){

    const rows = memberBody.querySelectorAll("tr");

    rows.forEach(row=>{

        row.querySelector(".renewal").value=0;
        row.querySelector(".transfer").value=0;
        row.querySelector(".success").value=0;

        row.querySelector(".rate").textContent="0.0%";

        const btn=row.querySelector(".save-btn");

        btn.innerHTML="저장";
        btn.disabled=false;
        btn.style.background="";

    });

    db.ref("renewal").remove()
.then(()=>{

    updateSummary();

    showToast();

})
.catch((err)=>{

    console.error(err);

});

}



/* ======================================================
   새로고침
====================================================== */

document
.getElementById("btnRefresh")
.addEventListener("click",()=>{

    alert("Firebase 연동 후 사용 가능합니다.");

});



/* ======================================================
   메인가기
====================================================== */

document
.getElementById("btnHome")
.addEventListener("click",()=>{

    location.href="renewal_home.html";

});
/* ======================================================
   권매방 전송
====================================================== */

document
.getElementById("btnTelegram")
.addEventListener("click",()=>{

    document.getElementById("telegramPassword").value="";

    telegramModal.classList.remove("hidden");

});


document
.getElementById("telegramCancel")
.addEventListener("click",()=>{

    telegramModal.classList.add("hidden");

});


document
.getElementById("telegramConfirm")
.addEventListener("click",()=>{

    const pw =
        document.getElementById("telegramPassword").value;

    if(pw!==ADMIN_PASSWORD){

        alert("비밀번호가 올바르지 않습니다.");

        return;

    }

    telegramModal.classList.add("hidden");

    alert("권매방 전송 기능은 V0.5(Telegram)에서 구현됩니다.");

});



/* ======================================================
   센터 검색
====================================================== */

document
.getElementById("centerSelect")
.addEventListener("change",function(){

    const center=this.value;

    const rows=memberBody.querySelectorAll("tr");

    rows.forEach(row=>{

        row.style.display="";

        if(center==="") return;

        if(row.cells[0].textContent!==center){

            row.style.display="none";

        }

    });

});



/* ======================================================
   성명 검색
====================================================== */

document
.getElementById("searchName")
.addEventListener("input",function(){

    const keyword=this.value.trim();

    const center=document.getElementById("centerSelect").value;

    const rows=memberBody.querySelectorAll("tr");

    let firstRow=null;

    rows.forEach(row=>{

        const rowCenter=row.cells[0].textContent.trim();
        const rowName=row.cells[1].textContent.trim();

        const centerMatch=
            center==="" || rowCenter===center;

        const nameMatch=
            keyword==="" || rowName.includes(keyword);

        if(centerMatch && nameMatch){

            row.style.display="";

            if(firstRow===null){

                firstRow=row;

            }

        }else{

            row.style.display="none";

        }

    });

    if(firstRow){

        firstRow.scrollIntoView({

            behavior:"smooth",

            block:"center"

        });

    }

});

/* ======================================================
   Firebase 불러오기
====================================================== */

function loadFirebase(){

    db.ref("renewal").once("value",(snapshot)=>{

        const data = snapshot.val();

        if(!data) return;

        const rows = memberBody.querySelectorAll("tr");

        rows.forEach(row=>{

            const center = row.cells[0].textContent.trim();
            const name = row.cells[1].textContent.trim();

            if(
                data[center] &&
                data[center][name]
            ){

                const item = data[center][name];

                row.querySelector(".renewal").value =
                    item.renewal || 0;

                row.querySelector(".transfer").value =
                    item.transfer || 0;

                row.querySelector(".success").value =
                    item.success || 0;

            }

        });

        updateSummary();

    });

}

/* ======================================================
   END
====================================================== */

updateSummary();
