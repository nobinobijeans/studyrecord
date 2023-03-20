// 日付を取得
const date = new Date();
const year = date.getFullYear();
const month = ("0" + (date.getMonth() + 1)).slice(-2);
const day = ("0" + date.getDate()).slice(-2);
const dateString = `${year}-${month}-${day}`;

// フォーム送信時の処理
const form = document.querySelector("form");
form.addEventListener("submit", function (event) {
  event.preventDefault();

  const content = document.querySelector("#content").value;
  const time = parseInt(document.querySelector("#time").value);

  // ローカルストレージからデータを取得
  let data = localStorage.getItem(dateString);
  if (data === null) {
    data = {};
  } else {
    data = JSON.parse(data);
  }

  // データを更新
  if (data[content] === undefined) {
    data[content] = time;
  } else {
    data[content] += time;
  }

  // ローカルストレージに保存
  localStorage.setItem(dateString, JSON.stringify(data));

  // グラフを更新
  updateGraph();
});

// グラフを表示
function updateGraph() {
  // ローカルストレージからデータを取得
  const data = JSON.parse(localStorage.getItem(dateString));

  // グラフを描画
  const graph = document.querySelector("#graph");
  graph.innerHTML = "";

  const graphData = [];
  let total = 0;
  for (const key in data) {
    graphData.push({ name: key, value: data[key] });
    total += data[key];
  }

  const colors = {
    video: "#4285f4",
    text: "#34a853",
    others: "#fbbc05",
  };

  const margin = { top: 20, right: 20, bottom: 40, left: 60 };
  const width = graph.offsetWidth - margin.left - margin.right;
  const height = graph.offsetHeight - margin.top - margin.bottom;

  const x = d3
    .scaleBand()
    .domain(graphData.map((d) => d.name))
    .range([0, width])
    .padding(0.2);

  const y = d3.scaleLinear().domain([0, total]).range([height, 0]);

  const svg = d3
    .select("#graph")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x));

  svg.append("g").call(d3.axisLeft(y));

  svg
    .selectAll("rect")
    .data(graphData)
    .enter()
    .append("rect")
    .attr("x", (d) => x(d.name))
    .attr("y", (d) => y(d.value))
    .attr("width", x.bandwidth())
    .attr("height", (d) => height - y(d.value))
    .attr("fill", (d) => colors[d.name]);
}

// 初期表示
updateGraph();
