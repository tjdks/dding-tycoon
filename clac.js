// 해양 조합법 데이터
const tiers = {
    "1티어": [
        {name:"수호의 정수", material:{"굴1":1}},
        {name:"파동의 정수", material:{"소라1":1}},
        {name:"혼란의 정수", material:{"문어1":1}},
        {name:"생명의 정수", material:{"미역1":1}},
        {name:"부식의 정수", material:{"성게1":1}},
    ],
    "2티어": [
        {name:"수호 에센스", material:{"굴2":2,"해초":2,"관산호":1}},
        {name:"파동 에센스", material:{"소라2":2,"해초":2,"사방산호":1}},
        {name:"혼란 에센스", material:{"문어2":2,"해초":2,"거품산호":1}},
        {name:"생명 에센스", material:{"미역2":2,"해초":2,"불산호":1}},
        {name:"부식 에센스", material:{"성게2":2,"해초":2,"뇌산호":1}},
    ],
    "3티어": [
        {name:"수호의 엘릭서", material:{"굴3":1,"불우렁쉥이":3,"유리병":5,"네더렉":32}, price:2403},
        {name:"파동의 엘릭서", material:{"소라3":1,"불우렁쉥이":3,"유리병":5,"마그마블록":16}, price:2438},
        {name:"혼란의 엘릭서", material:{"문어3":1,"불우렁쉥이":3,"유리병":5,"영혼모래":16}, price:2512},
        {name:"생명의 엘릭서", material:{"미역3":1,"불우렁쉥이":3,"유리병":5,"진홍빛자루":8}, price:2180},
        {name:"부식의 엘릭서", material:{"성게3":1,"불우렁쉥이":3,"유리병":5,"뒤틀린자루":8}, price:2250},
        {name:"영생의 아쿠티스", material:{"수호의 정수":1,"질서 파괴의 핵":1,"활력 붕괴의 핵":1}, price:2403},
        {name:"크라켄의 광란체", material:{"질서 파괴의 핵":1,"활력 붕괴의 핵":1,"파동 오염의 핵":1}, price:2438},
        {name:"리바이던의 깃털", material:{"침식 방어의 핵":1,"파동 오염의 핵":1,"물결 수호의 핵":1}, price:2512},
        {name:"해구의 파동 코어", material:{"활기 보존의 결정":1,"파도 침식의 결정":1,"격류 재생의 결정":1}, price:5184},
        {name:"청해룡의 날개", material:{"방어 오염의 결정":1,"맹독 혼란의 결정":1,"활기 보존의 결정":1}, price:5309},
        {name:"무저의 척추", material:{"타락 침식의 영약":1,"맹독 파동의 영약":1,"생명 광란의 영약":1}, price:5309},
    ]
};

// 계산 함수
function calculate() {
    const inventory = {};
    ["굴","소라","문어","미역","성게"].forEach(name=>{
        for(let i=1;i<=3;i++){
            inventory[`${name}${i}`] = parseInt(document.getElementById(`${name}${i}`).value) || 0;
        }
    });

    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = "";

    let totalRevenue = 0;

    for(let tier in tiers){
        let tierHTML = `<h3>${tier}</h3><table><tr><th>결과물</th><th>개수</th><th>수익(G)</th><th>필요 재료</th></tr>`;
        tiers[tier].forEach(item=>{
            let maxCount = Infinity;
            for(let mat in item.material){
                if(inventory[mat] !== undefined){
                    maxCount = Math.min(maxCount, Math.floor(inventory[mat]/item.material[mat]));
                }
            }
            if(maxCount === Infinity) maxCount = 0;

            for(let mat in item.material){
                if(inventory[mat] !== undefined){
                    inventory[mat] -= item.material[mat]*maxCount;
                }
            }

            let materialsStr = Object.entries(item.material).map(([k,v])=>`${k}:${v*maxCount}`).join(", ");

            tierHTML += `<tr>
                <td>${item.name}</td>
                <td>${maxCount}</td>
                <td>${item.price?item.price*maxCount:0}</td>
                <td>${materialsStr}</td>
            </tr>`;

            if(item.price) totalRevenue += item.price*maxCount;
        });
        tierHTML += `</table>`;
        resultDiv.innerHTML += tierHTML;
    }

    resultDiv.innerHTML += `<h3>총 수익: ${totalRevenue} G</h3>`;
}

document.getElementById("calculateBtn").addEventListener("click", calculate);
