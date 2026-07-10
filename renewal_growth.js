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

        const data = snapshot.val() || {};

        renderGrowth(data);

    });

}
/* ======================================================
   표 출력
====================================================== */

function renderGrowth(data){

    growthBody.innerHTML="";

    let list=[];

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

        if(b.rate!==a.rate){

            return b.rate-a.rate;

        }

        return b.success-a.success;

    });

    let totalRenewal=0;
    let totalTransfer=0;
    let totalSuccess=0;
      list.forEach((item,index)=>{

        totalRenewal += item.renewal;
        totalTransfer += item.transfer;
        totalSuccess += item.success;

        growthBody.innerHTML += `

        <tr>

            <td>${index+1}</td>

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

    loadGrowth();

});

searchName.addEventListener("input",()=>{

    loadGrowth();

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

    const top=list[0];

    const avg=
        list.reduce((a,b)=>a+b.rate,0)/list.length;

    const low=
        [...list].sort((a,b)=>a.rate-b.rate)[0];

    document.getElementById("aiTop").textContent=
        `🏆 우수 담당자 : ${top.name} (${top.rate.toFixed(1)}%)`;

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
