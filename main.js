// グラフの設定
var margin = { top: 50, right: 50, bottom: 50, left: 50 };
var width = 800 - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;
var barPadding = 5;

// x軸のスケールを設定
var xScale = d3.scaleBand()
  .range([0, width])
  .padding(0.1);

// y軸のスケールを設定
var yScale = d3.scaleLinear()
  .range([height, 0]);

// svg要素を作成
var svg = d3.select("body")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// CSVファイルからデータを取得し、グラフを描画
d3.csv("data.csv", function(error, data) {
  if (error) throw error;

  // データの加工
  var studyTimeByDate = d3.nest()
    .key(function(d) { return d.date; })
    .rollup(function(v) {
      return {
        date: v[0].date,
        video: d3.sum(v, function(d) { return d.video; }),
        text: d3.sum(v, function(d) { return d.text; }),
        others: d3.sum(v, function(d) { return d.others; })
      };
    })
    .entries(data);

  // x軸、y軸のドメインを設定
  xScale.domain(studyTimeByDate.map(function(d) { return d.key; }));
  yScale.domain([0, d3.max(studyTimeByDate, function(d) {
    return d.value.video + d.value.text + d.value.others;
  })]);

  // x軸を追加
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScale));

  // y軸を追加
  svg.append("g")
    .attr("class", "y axis")
    .call(d3.axisLeft(yScale));

  // 棒グラフを追加
  svg.selectAll(".bar")
    .data(studyTimeByDate)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", function(d) { return xScale(d.key); })
    .attr("width", xScale.bandwidth())
    .attr("y", function(d) { return yScale(d.value.video + d.value.text + d.value.others); })
    .attr("height", function(d) { return height - yScale(d.value.video + d.value.text + d.value.others); })
    .attr("fill", function(d) {
      if (d.value.video >= d.value.text && d.value.video >= d.value.others) {
        return "#1f77b4"; // blue
      } else if (d.value.text >= d.value.video && d.value.text >= d.value.others) {
        return
