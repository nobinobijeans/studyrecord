// 日付のフォーマットを設定
const formatTime = d3.timeFormat('%Y/%m/%d');

// グラフの大きさを設定
const width = 800;
const height = 400;
const margin = {top: 20, right: 20, bottom: 40, left: 50};
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

// SVG要素を作成
const svg = d3.select('#graph')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

// データを格納する配列を用意
let studyData = [];

// 「記録する」ボタンがクリックされた時の処理
function record() {
  const studyType = document.getElementById('study-type').value;
  const studyTime = Number(document.getElementById('study-time').value);

  if (isNaN(studyTime)) {
    alert('勉強時間には数値を入力してください');
    return;
  }

  const today = new Date();
  const todayStr = formatTime(today);
  const existingData = studyData.find(data => data.date === todayStr && data.type === studyType);

  if (existingData) {
    existingData.time += studyTime;
  } else {
    studyData.push({
      date: todayStr,
      type: studyType,
      time: studyTime
    });
  }

  drawGraph(studyData);
}

// グラフを描画する関数
function drawGraph(data) {
  // 日付の範囲を取得
  const dateRange = d3.extent(data, d => new Date(d.date));

  // 縦軸のスケールを設定
  const timeRange = [0, d3.max(data, d => d.time)];
  const yScale = d3.scaleLinear()
    .domain(timeRange)
    .range([innerHeight, 0]);

  // 横軸のスケールを
  const margin = { top: 20, right: 20, bottom: 70, left: 40 };
  const width = 600 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;

  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.json("data.json", function (data) {
    data.forEach(function (d) {
      d.date = d3.timeParse("%Y-%m-%d")(d.date);
      d.total = +d.total;
    });

    const x = d3
      .scaleBand()
      .range([0, width])
      .padding(0.1)
      .domain(data.map(function (d) { return d.date; }));

    const y = d3.scaleLinear().range([height, 0]).domain([0, 10]);

    const colors = d3.scaleOrdinal()
      .domain(["video", "text", "the others"])
      .range(["#98abc5", "#8a89a6", "#7b6888"]);

    const tooltip = d3.select("#chart").append("div").attr("class", "tooltip");

    svg
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", function (d) { return x(d.date); })
      .attr("width", x.bandwidth())
      .attr("y", function (d) { return y(d.total); })
      .attr("height", function (d) { return height - y(d.total); })
      .attr("fill", function(d) { return colors(d.content); })
      .on("mouseover", function(d) {
        tooltip
          .style("opacity", 1)
          .html("<strong>" + d.date.toLocaleDateString() + "</strong><br/>" + d.content + ": " + d.total + " hours")
          .style("left", d3.event.pageX + "px")
          .style("top", d3.event.pageY - 28 + "px");
      })
      .on("mouseout", function(d) {
        tooltip.style("opacity", 0);
      });

    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("transform", "rotate(-45)")
      .attr("dx", "-.8em")
      .attr("dy", ".15em");

    svg.append("g").call(d3.axisLeft(y));
  });
