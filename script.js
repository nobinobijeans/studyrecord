// 日ごとの勉強時間を保存する配列
let studyData = [];

// フォームの送信イベントに対する処理
document.querySelector('form').addEventListener('submit', function(e) {
  e.preventDefault(); // デフォルトの送信処理を中止

  // フォームの値を取得
  const studyType = document.querySelector('input[name="study-type"]:checked').value;
  const studyTime = document.querySelector('input[name="study-time"]').value;
  const studyDate = document.querySelector('input[name="study-date"]').value;

  // 日付をキーとしたオブジェクトを作成し、勉強時間を配列に追加
  const studyObj = {date: studyDate, type: studyType, time: studyTime};
  studyData.push(studyObj);

  // グラフを描画する
  drawGraph(studyData);
});

// グラフを描画する関数
function drawGraph(data) {
  // グラフの幅、高さ、余白
  const width = 800;
  const height = 400;
  const margin = { top: 20, right: 20, bottom: 30, left: 50 };

  // SVG要素を作成
  const svg = d3.select("svg");
  svg.selectAll("*").remove(); // 既存の要素を削除
  svg.attr("width", width).attr("height", height);

  // グラフの描画範囲を決定
  const chart = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // 日付の範囲を決定
  const dateExtent = d3.extent(data, d => new Date(d.date)); // 日付の範囲
  const xScale = d3.scaleTime().domain(dateExtent).range([0, innerWidth]); // 日付をx座標に対応させる

  // 勉強時間の範囲を決定
  const timeExtent = [0, d3.max(data, d => +d.time)]; // 勉強時間の範囲
  const yScale = d3.scaleLinear().domain(timeExtent).range([innerHeight, 0]); // 勉強時間をy座標に対応させる

  var barWidth = (chartWidth / data.length) * 0.8;
  var bar = chart.selectAll("g")
      .data(data)
      .enter().append("g")
      .attr("transform", function(d, i) { return "translate(" + i * barWidth + ",0)"; });

  bar.append("rect")
      .attr("y", function(d) { return chartHeight - y(d.time); })
      .attr("height", function(d) { return y(d.time); })
      .attr("width", barWidth - 1)
      .style("fill", function(d) {
          switch(d.type) {
              case "video":
                  return "red";
              case "text":
                  return "blue";
              case "the others":
                  return "green";
          }
      });

  // Y軸を追加する
  var yAxis = d3.axisLeft(y);
  chart.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  // X軸を追加する
  var xAxis = d3.axisBottom(x);
  chart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + chartHeight + ")")
      .call(xAxis);

  // グリッド線を追加する
  chart.append('g')
      .attr('class', 'grid')
      .attr('transform', 'translate(0,' + chartHeight + ')')
      .call(d3.axisBottom()
          .scale(x)
          .tickSize(-chartHeight, 0, 0)
          .tickFormat('')
      )

  chart.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft()
          .scale(y)
          .tickSize(-chartWidth, 0, 0)
          .tickFormat('')
      )
});

