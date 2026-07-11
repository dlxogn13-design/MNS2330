/* ======================================================
   RMS Renewal Growth
   renewal_growth.js
   V0.3
====================================================== */

/* ======================================================
   Firebase
====================================================== */

if (!firebase.apps.length) {

    firebase.initializeApp({
        databaseURL:"https://sales-dashboard-e7a79-default-rtdb.firebaseio.com"
    });

}

const db = firebase.database();

/* ======================================================
   DOM
====================================================== */

const growthBody =
document.getElementById("growthBody");

const centerSelect =
document.getElementById("centerSelect");

const periodSelect =
document.getElementById("periodSelect");

const searchName =
document.getElementById("searchName");

let currentData = {};

const btnTelegram =
document.getElementById("btnTelegram");

const telegramModal =
document.getElementById("telegramModal");

const telegramPassword =
document.getElementById("telegramPassword");

const telegramConfirm =
document.getElementById("telegramConfirm");

const telegramCancel =
document.getElementById("telegramCancel");

/* ======================================================
   시작
====================================================== */

document.addEventListener("DOMContentLoaded",()=>{

    loadGrowth();

});

/* ======================================================
   Firebase 읽기
====================================================== */

function loadGrowth(){

    db.ref("renewal").on("value",(snapshot)=>{

        currentData = snapshot.val() || {};

        renderGrowth(currentData);

    });

}
/* ======================================================
   표 출력
====================================================== */

function renderGrowth(data){

    growthBody.innerHTML="";

    let list=[];
   
   const selectedCenter = centerSelect.value;

   const keyword =
    searchName.value.trim().toLowerCase();

    Object.keys(data).forEach(center=>{

        Object.keys(data[center]).forEach(name=>{

            const item=data[center][name];

            const renewal=item.renewal||0;
            const transfer=item.transfer||0;
            const success=item.success||0;

            const rate=
                renewal===0
                ?0
                :(success/renewal*100);
// 센터 필터
if(
    selectedCenter &&
    center !== selectedCenter
){
    return;
}

// 성명 검색
if(
    keyword &&
    !name.toLowerCase().includes(keyword)
){
    return;
}
            list.push({

                center:center,
                name:name,
                renewal:renewal,
                transfer:transfer,
                success:success,
                rate:rate

            });

        });

    });

    list.sort((a,b)=>{

    // 성공률 우선
    if(b.rate!==a.rate){

        return b.rate-a.rate;

    }

    // 성공건수
    if(b.success!==a.success){

        return b.success-a.success;

    }

    // 권매건수

    return b.renewal-a.renewal;

});

    let totalRenewal=0;
    let totalTransfer=0;
    let totalSuccess=0;
    let rank = 1;
    let displayRank = 1;
   
      list.forEach((item,index)=>{

    if(index>0){

        const prev=list[index-1];

        if(
            item.rate===prev.rate &&
            item.success===prev.success &&
            item.renewal===prev.renewal
        ){

            displayRank=rank;

        }else{

            rank=index+1;
            displayRank=rank;

        }

    }

        totalRenewal += item.renewal;
        totalTransfer += item.transfer;
        totalSuccess += item.success;

      growthBody.innerHTML += `

<tr>

    <td>${displayRank}</td>

    <td>${item.center}</td>

    <td>${item.name}</td>

    <td>${item.renewal}</td>

    <td>${item.transfer}</td>

    <td>${item.success}</td>

    <td>${item.rate.toFixed(1)}%</td>

</tr>

`;

});
    document.getElementById("sumRenewal").textContent =
        totalRenewal;

    document.getElementById("sumTransfer").textContent =
        totalTransfer;

    document.getElementById("sumSuccess").textContent =
        totalSuccess;

    const totalRate =
        totalRenewal===0
        ?0
        :(totalSuccess/totalRenewal*100);

    document.getElementById("sumRate").textContent =
        totalRate.toFixed(1)+"%";

    updateAI(list);

}
/* ======================================================
   검색
====================================================== */

centerSelect.addEventListener("change",()=>{

    renderGrowth(currentData);

});

searchName.addEventListener("input",()=>{

    renderGrowth(currentData);

});


/* ======================================================
   AI 분석
====================================================== */

function updateAI(list){

    if(list.length===0){

        document.getElementById("aiTop").textContent =
        "🏆 오늘 입력된 데이터가 없습니다.";

        document.getElementById("aiCenter").textContent =
        "📊 센터 평균을 계산할 수 없습니다.";

        document.getElementById("aiImprove").textContent =
        "📈 분석 대상이 없습니다.";

        return;

    }

const topRate = list[0].rate;
const topSuccess = list[0].success;
const topRenewal = list[0].renewal;

const topMembers = list.filter(item =>
    item.rate === topRate &&
    item.success === topSuccess &&
    item.renewal === topRenewal
);

    const avg=
        list.reduce((a,b)=>a+b.rate,0)/list.length;

    const low=
        [...list].sort((a,b)=>a.rate-b.rate)[0];

    document.getElementById("aiTop").textContent =
`🏆 우수 담당자 : ${topMembers.map(x=>x.name).join(", ")} (${topRate.toFixed(1)}%)`;

    document.getElementById("aiCenter").textContent=
    `🎯 전체 평균 성공률 : ${avg.toFixed(1)}%`;

document.getElementById("aiImprove").textContent=
    `⚠️ 개선 대상 : ${low.name} (${low.rate.toFixed(1)}%)`;

}


/* ======================================================
   버튼
====================================================== */

document
.getElementById("btnHome")
.addEventListener("click",()=>{

    location.href="renewal_home.html";

});

document
.getElementById("btnRefresh")
.addEventListener("click",()=>{

    loadGrowth();

});


/* ======================================================
   권매방 전송 모달
====================================================== */

btnTelegram.addEventListener("click",()=>{

    telegramPassword.value="";

    telegramModal.classList.remove("hidden");

    telegramPassword.focus();

});

telegramCancel.addEventListener("click",()=>{

    telegramModal.classList.add("hidden");

});

telegramConfirm.addEventListener("click",()=>{

    if(telegramPassword.value !== "2330"){

        alert("비밀번호가 올바르지 않습니다.");

        telegramPassword.value="";

        return;

    }

    telegramModal.classList.add("hidden");

    alert("권매방 전송 기능은 다음 단계에서 연결합니다.");

});
