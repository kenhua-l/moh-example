// make adjustments to chart.js here
Chart.defaults.font.family = 'Barlow';
class ProgressDonut extends Chart.DoughnutController {
  draw(ease) {
    var ctx = this.chart.ctx;
    var easingDecimal = ease || 1;
    var arcs = this.getMeta().data;
    // draw the normal arc first
    Chart.helpers.each(arcs, function(arc, i) {
      arc.draw(ctx);
    });
    // add the "curved edges" to the ends
    Chart.helpers.each(arcs, function(arc, i) {
      // only the first number matters
      if(i==0){
        var radius = (arc.outerRadius + arc.innerRadius) / 2;
        var thickness = (arc.outerRadius - arc.innerRadius) / 2;
        var startAngle = Math.PI - arc.startAngle - Math.PI / 2;
        var endAngle = Math.PI - arc.endAngle - Math.PI / 2;
        ctx.save();
        ctx.translate(arc.x, arc.y);
        ctx.fillStyle = arc.options.backgroundColor;
        ctx.beginPath();
        ctx.arc(radius * Math.sin(startAngle), radius * Math.cos(startAngle), thickness, 0, 2 * Math.PI);
        ctx.arc(radius * Math.sin(endAngle), radius * Math.cos(endAngle), thickness, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    });
  }
};
ProgressDonut.id = "ProgressDonut";
ProgressDonut.defaults = Chart.DoughnutController.defaults;
Chart.register(ProgressDonut);

class BarWithHover extends Chart.BarController {
  draw(ease) {
    Chart.controllers.bar.prototype.draw.call(this, ease);
    var ctx = this.chart.ctx;
    var topY = this.chart.scales.y.top;
    var bottomY = this.chart.scales.y.bottom;

    if (this.chart.tooltip._active && this.chart.tooltip._active.length) {
      var activePoint = this.chart.tooltip._active[0],
        x = activePoint.element.x;
      // draw line
      ctx.save();
      ctx.setLineDash([5,1]);
      ctx.beginPath();
      ctx.moveTo(x, topY);
      ctx.lineTo(x, bottomY);
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#999';
      ctx.shadowBlur = 1;
      ctx.stroke();
      ctx.closePath();
      ctx.restore();
    }
  }
}
BarWithHover.id = "Bar";
BarWithHover.defaults = Chart.BarController.defaults;
Chart.register(BarWithHover);

class LineWithHover extends Chart.LineController {
  draw(ease) {
    Chart.controllers.line.prototype.draw.call(this, ease);
    var ctx = this.chart.ctx;
    var topY = this.chart.scales.y.top;
    var bottomY = this.chart.scales.y.bottom;
    // ctx.closePath();

    // console.log(this.chart.tooltip._active);
    if (this.chart.tooltip._active && this.chart.tooltip._active.length) {
      var activePoint = this.chart.tooltip._active[0],
        x = activePoint.element.x;
      // draw line
      // var x = 80;
      ctx.save();
      ctx.setLineDash([5,1]);
      ctx.beginPath();
      ctx.moveTo(x, topY);
      ctx.lineTo(x, bottomY);
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#999';
      ctx.shadowBlur = 1;
      ctx.stroke();
      ctx.closePath();
      ctx.restore();
    }
  }
}
LineWithHover.id = "Line";
LineWithHover.defaults = Chart.LineController.defaults;
Chart.register(LineWithHover);

// write Title and timestamp
var $ = jQuery;
const createMeta = function(timestamp, title) {
  var meta = jQuery('<div class="chart-meta"></div>');
  if(timestamp) {
    meta.append('<p class="timestamp">'+ timestamp + '</p>');
  }
  if(title) {
    meta.append('<p class="title">'+ title + '</p>');
  }
  return meta;
}

// write own tooltip (copied and modified from chartjs)
const getOrCreateTooltip = function(chart) {
  let tooltipEl = chart.canvas.parentNode.querySelector('.chart-tooltip');
  if (!tooltipEl) { // create tooltip if there isn't one
    tooltipEl = document.createElement('div');
    tooltipEl.classList.add('chart-tooltip'); // use class to style tooltip
    const tooltipInfo = document.createElement('div');
    tooltipInfo.classList.add('chart-tooltip-info');
    tooltipEl.appendChild(tooltipInfo);
    chart.canvas.parentNode.appendChild(tooltipEl);
  }
  return tooltipEl;
};
const externalTooltipHandler = function(context) {
  // Tooltip Element
  const {chart, tooltip} = context;
  var hasTotal = (chart.config._config.type === 'Bar' || chart.config._config.type === 'bar')  ? true : false;
  const tooltipEl = getOrCreateTooltip(chart);

  // Hide if no tooltip
  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = 0;
    return;
  }

  // Set Text
  if (tooltip.body) {
    const titleLines = tooltip.title || [];
    const bodyLines = tooltip.body.map(function(b) { return b.lines });
    hasTotal = bodyLines.length === 1 ? true : hasTotal;

    const titleDiv = document.createElement('div');

    titleLines.forEach(title => {
      const titleP = document.createElement('p');
      titleP.classList.add('title');
      const titleText = document.createTextNode(title);

      titleP.appendChild(titleText);
      titleDiv.appendChild(titleP);
    });

    const statDiv = document.createElement('div');
    statDiv.classList.add('tooltip-stats')
    bodyLines.forEach((body, i) => {
      let isLine = context.tooltip.dataPoints[i].dataset.type === 'line'
      // <div><span><b>Total case: xx</b></span></div>
      // <div><span class="tooltip-square"></span><span>x years old: <b>x</b></span></div>
      const statItem = document.createElement('div');
      const textSpan = document.createElement('span');
      const bold = document.createElement('b');

      if(hasTotal && isLine && i==0) {
        bold.appendChild(document.createTextNode(body));
        textSpan.appendChild(bold);
      } else {
        let label = tooltip.dataPoints[i].dataset.label;
        let stat = tooltip.dataPoints[i].formattedValue;
        let colors = tooltip.labelColors[i];
        // colored square
        const span = document.createElement('span');
        span.classList.add('tooltip-square');
        span.style.background = hasTotal ? colors.backgroundColor : colors.borderColor;
        statItem.appendChild(span);
        // info and stat
        textSpan.appendChild(document.createTextNode(label + ': '));
        bold.appendChild(document.createTextNode(stat));
        textSpan.appendChild(bold);
      }
      statItem.appendChild(textSpan);
      statDiv.appendChild(statItem);
    });

    const tooltipInfo = tooltipEl.querySelector('.chart-tooltip-info');

    // Remove old children
    while (tooltipInfo.firstChild) {
      tooltipInfo.firstChild.remove();
    }

    // Add new children
    tooltipInfo.appendChild(titleDiv);
    tooltipInfo.appendChild(statDiv);

  }

  // Display, position
  const {offsetLeft: positionX, offsetTop: positionY} = chart.canvas;
  tooltipEl.style.opacity = 1;
  tooltipEl.style.top = positionY + tooltip.caretY + 'px';
  if((tooltip.caretX + 200) > chart.width) {
    let offset = hasTotal ? 180 : 220;
    tooltipEl.style.left = positionX + tooltip.caretX - offset + 'px' ;
  } else {
    tooltipEl.style.left = positionX + tooltip.caretX + 'px';
  }
};

const externalPieTooltipHandler = function(context) {
  // Tooltip Element
  const {chart, tooltip} = context;
  const tooltipEl = getOrCreateTooltip(chart);

  // Hide if no tooltip
  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = 0;
    return;
  }

  // Set Text
  if (tooltip.body) {
    const titleLines = tooltip.title || [];
    const bodyLines = tooltip.body.map(function(b) { return b.lines });

    const statDiv = document.createElement('div');
    statDiv.classList.add('tooltip-stats');
    bodyLines.forEach((body, i) => {
      let percentSymbol = tooltip.dataPoints[i].dataset.isPercentage;
      let showPercentage = tooltip.dataPoints[i].dataset.showPercentage;
      let percentages = tooltip.dataPoints[i].dataset;
      const statItem = document.createElement('div');
      const textSpan = document.createElement('span');
      const bold = document.createElement('b');

      let label = tooltip.dataPoints[i].dataset.label[tooltip.dataPoints[i].dataIndex];
      let stat = tooltip.dataPoints[i].formattedValue;
      let colors = tooltip.labelColors[i];

      // colored square
      const span = document.createElement('span');
      span.classList.add('tooltip-square');
      span.style.background = colors.backgroundColor;
      statItem.appendChild(span);
      // info and stat
      textSpan.appendChild(document.createTextNode(label + ': '));
      bold.appendChild(document.createTextNode(stat + (percentSymbol ? '%' : '')));


      let percentData = tooltip.dataPoints[i].dataset.percent[tooltip.dataPoints[i].dataIndex];

      if(showPercentage && !percentSymbol && !!percentData) {
        // let total = tooltip.dataPoints[i].dataset.data.reduce(function(a,b){
        //   return a + b;
        // }, 0);
        // let percentage = document.createElement('span');
        // percentage.classList.add('percent')
        // let percent = parseFloat((tooltip.dataPoints[i].parsed / total * 100).toFixed(2)); // this is for auto calculating 100%
        let percent = parseFloat(tooltip.dataPoints[i].dataset.percent[tooltip.dataPoints[i].dataIndex].toFixed(2));
        // percentage.appendChild(document.createTextNode(percent + '%'));
        bold.appendChild(document.createTextNode(' (' + percent + '%)'));
        // bold.appendChild(percentage);
      }

      textSpan.appendChild(bold);
      statItem.appendChild(textSpan);
      statDiv.appendChild(statItem);
    });

    const tooltipInfo = tooltipEl.querySelector('.chart-tooltip-info');

    // Remove old children
    while (tooltipInfo.firstChild) {
      tooltipInfo.firstChild.remove();
    }

    // Add new children
    tooltipInfo.appendChild(statDiv);
  }

  // Display, position
  const {offsetLeft: positionX, offsetTop: positionY} = chart.canvas;
  tooltipEl.style.opacity = 1;
  tooltipEl.style.top = positionY + tooltip.caretY + 'px';
  if(tooltip.caretX > (chart.width/2)) {
    tooltipEl.style.left = positionX + tooltip.caretX - (chart.width/3) + 'px' ;
  } else {
    tooltipEl.style.left = positionX + tooltip.caretX  + 'px' ;
  }
};

// write own legend
const createLegend = function(datasets, isLineChart, hasTotal) {
  var legendContainer = jQuery('<div class="legend-container"></div>');
  datasets.forEach(function(data) {
    let shape = isLineChart ? 'oblong' : 'circle';
    let color = isLineChart ? data.borderColor : data.backgroundColor;
    if(hasTotal && data.type && data.type === 'line'){
      shape = 'oblong';
      color = data.borderColor;
    }
    legendContainer.append(
      '<div class="stat-item">' +
      '<span class="stat-item__' + shape + '" style="background:' + color + '"></span>' +
      '<span class="stat-item__info">' + data.label + '</span>' +
      '</div>'
    )
  });
  return legendContainer;
}

// create Today total
const createTodayTotal = function(datasets, isLineChart) {
  var todayTotal = jQuery('<div class="today"></div>');
  // reverse the data because it is shown in reverse order
  datasets.reverse().forEach(function(data) {
    let color = isLineChart ? data.borderColor : data.backgroundColor;
    if(data.type && data.type === 'line') {
      todayTotal.prepend('<p class="title">' + data.data[data.data.length - 1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</p>');
    } else {
      todayTotal.append(
        '<div class="today-info">' +
        '<span class="today-circle" style="background:' + color + '"></span>' +
        '<span class="today-stat">' + data.data[data.data.length - 1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</span>' +
        '</div>'
      );
    }
  });
  // then reverse back - this is needed because we are using the pointer to the array rather than a copy of it.
  datasets.reverse();
  return todayTotal;
}

// create sharing buttons
const createSharing = function() {
  let sharingButtons = jQuery('<div class="sharing-button" data-html2canvas-ignore="true"></div');
  sharingButtons.append('<a class="download-share-link" data-type="download"><span class="moh-icon moh-icon-download"></span>Download</a>');
  if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    sharingButtons.append('<a class="download-share-link" data-type="share-mobile"><span class="moh-icon moh-icon-share"></span>Share</a>');
  } else {
    sharingButtons.append('<div class="download-share-link" data-type="share-computer"><button type="button"><span class="moh-icon moh-icon-share"></span>Share</button></div>');
  }

  return sharingButtons;
}

const updateShare = function($this, title) {
  // download the image
  // $this.find('.sharing-button .download-share-link[data-type="download"]').attr('href', baseImg).attr('download', title);
  $this.find('.sharing-button .download-share-link[data-type="download"]').on('click', function() {
    html2canvas($this[0], { allowTaint: true }).then(function(canvas) {
      canvas.toBlob(function(blob) {
        saveAs(blob, title + '.jpg');
      })
    });
  });

  // check if it is mobile
  if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    // share on mobile using navigator share
    $this.find('.sharing-button .download-share-link[data-type="share-mobile"]').on('click', async function() {
      try {
        await navigator.share({
          title: title,
          file: [baseImg]
        })
      } catch (err) {
        console.log(err);
      }
    });
  } else {
    // share url on computer - 3 ways - Facebook, Twitter, Email
    let shareComputer = $this.find('.sharing-button .download-share-link[data-type="share-computer"]');
    if(!shareComputer.find('.share-url').length) {
      $ = jQuery;
      let shareUrl = jQuery('<div class="share-url"></div>');
      let thisLink = location.protocol + '//' + location.host + location.pathname + '%23' + $this.attr('id');
      shareUrl.append('<span class="pointer"></span>')
      shareUrl.append('<a href="https://www.facebook.com/sharer.php?u=' + thisLink + '" target="_blank" rel="noopener noreferrer" aria-label="share on facebook"><span class="sgds-icon sgds-icon-facebook-alt"></span>Facebook</a>')
      shareUrl.append('<a href="https://twitter.com/intent/tweet?url=' + decodeURI(thisLink) + '&text=' + title + '" target="_blank" rel="noopener noreferrer" aria-label="share on twitter"><span class="sgds-icon sgds-icon-twitter"></span>Twitter</a>')
      shareUrl.append('<a href="mailto:?subject=' + title + '&body=' + thisLink + '" target="_blank" rel="noopener noreferrer" aria-label="share on email"><span class="sgds-icon sgds-icon-mail"></span>Email</a>')
      shareComputer.append(shareUrl);
      shareComputer.on('click', function() {
        shareUrl.toggle();
      });
    }
  }
}

// the graphs all render in this section
$.fn.extend({
  // 1. Box Progress - takes in multiple percentage values out of 100% -85 lines
  ProgressBox: function(options) {
    var $ = jQuery;
    var $this = $(this);
    $this.addClass('progress-box').wrap('<div style="overflow:auto;padding-bottom:1rem;"></div>');
    var neutralColor = options.neutralColor ? options.neutralColor : '#ccc';
    // append title
    if(options.title) {
      $this.append('<p class="title">'+ options.title + '</p>');
    }

    // process data
    var data = options.data ? options.data : [];
    data = data.sort(function(a, b) {
      return b.stat - a.stat;
    });

    // create the boxes
    let boxesContainer = $('<div class="box-container"></div>');
    for(var i=1; i<=100; i++){
      let box = $('<div class="box" data-num="' + i + '"><span style="background:' + neutralColor + '"></span></div>');
      data.forEach(function(stat) {
        if(i <= stat.stat) {
          box.data('pct-' + stat.stat, stat.color);
          box.find('span').css('background', stat.color);
          if(box.data('hover-stat') && box.data('hover-stat') > stat.stat) {
            box.data('hover-stat', stat.stat);
            box.data('hover-info', stat.info);
          } else {
            box.data('hover-stat', stat.stat);
            box.data('hover-info', stat.info);
          }

        }
      })
      boxesContainer.prepend(box);
    };

    // put in the hover box
    let infoBox = $('<div class="info-box"></div>');

    // bind the hovering events
    boxesContainer.on('mouseenter', '.box', function(e) {
      if($(this).data('hover-stat')) {
        let hoverStat = $(this).data('hover-stat');
        $(this).parent().children('.box').each(function() {
          if($(this).data('pct-' + hoverStat)) {
            $(this).find('span').css('background', $(this).data('pct-' + hoverStat))
          } else {
            $(this).find('span').css('background', neutralColor);
          }
        });
        infoBox.empty();
        infoBox.append('<span class="info-box__number">' + hoverStat + '%</span>');
        infoBox.append('<span class="info-box__info">' + $(this).data('hover-info') + '</span>');
      }
    });
    boxesContainer.on('mouseleave', '.box', function() {
      $(this).parent().children('.box').each(function() {
        let hoverStat = $(this).data('hover-stat');
        if($(this).data('pct-' + hoverStat)) {
          $(this).find('span').css('background', $(this).data('pct-' + hoverStat))
        }
      });
    });
    boxesContainer.on('mouseenter', function() {
      infoBox.show();
    });
    boxesContainer.on('mouseleave', function() {
      infoBox.hide();
    });
    boxesContainer.append(infoBox);

    $this.append(boxesContainer);

    // add the stat numbers on the right
    let statContainer = $('<div class="legend-container"></div>');
    data.forEach(function(stat) {
      let statItem = $('<div class="stat-item"></div>');
      statItem.append('<span class="stat-item__box" style="background:' + stat.color + '"></span>');
      statItem.append('<span class="stat-item__number">' + stat.stat + '%</span>');
      statItem.append('<span class="stat-item__info">' + stat.info + '</span>');
      statContainer.append(statItem);
    });
    $this.append(statContainer);
  },

  // 2. Box Progress - takes in TWO percentage values out of 100%
  // and breakdown of the data to be put on the side. - 93 lines
  ProgressDonut: function(options) {
    var $ = jQuery;
    var $this = $(this);
    $this.addClass('progress-donut chart-card');
    $(window).on('resize orientationchange load', function(){
      if($this.width() > 440) {
        $this.addClass('unstack');
      } else {
        $this.removeClass('unstack');
      }
    });

    // title and timestamp
    var meta = createMeta(options.timestamp, options.title);
    $this.append(meta);

    var maxwidth = options.width ? options.width : 230;
    var chart = $('<div class="chart-content donut-info"></div>');
    // chart section - dont do anything first until all DOM is settled
    var progressChart = $('<canvas></canvas>');
    var progressChartDiv = $('<div class="donut-div" style="max-width:' + maxwidth + 'px;max-height:' + maxwidth + 'px"></div>');
    progressChartDiv.append(progressChart);
    chart.append(progressChartDiv);

    // process data and put in legend first - making sure it is just 2
    var mainData = options.data ? options.data.slice(0, 2) : [];
    // legends
    var information = $('<div class="progress-donut-information"></div>');
    var legendContainer = $('<div class="legend-container"></div>');
    mainData.forEach(function(stat) {
      legendContainer.append(
        '<div class="stat-item">' +
        '<span class="stat-item__circle" style="background:' + stat.color + '"></span>' +
        '<span class="stat-item__info">' + stat.info + '</span>' +
        '<span class="stat-item__number">' + stat.stat + '%</span>' +
        '</div>'
      )
      // breakdown data
      var breakdownData = stat.breakdown ? stat.breakdown : [];
      var breakdownInfo = $('<div class="text-info"></div>');
      breakdownData.forEach(function(breakdown) {
        breakdownInfo.append(
          '<div class="info-line">' +
          '<span class="info-line__number">' + breakdown.stat + '%</span>' +
          '<span class="info-line__info">' + breakdown.info + '</span>' +
          '</div>'
        )
      });
      legendContainer.append(breakdownInfo);
    });

    information.append(legendContainer);
    chart.append(information);
    $this.append(chart);

    // sharing
    var sharing = createSharing();
    $this.append(sharing);
    let title = options.title ?? 'Stacked-Bar-Chart-with-Line-Trend';
    updateShare($this, title);

    // continue process data
    var neutralColor = options.donutColor ? options.donutColor : '#e0f0f8';
    var datasets = [];
    for(var i=0; i<2; i++) {
      if(i==1) datasets.push({ weight: 1 });
      if(mainData.length) {
        let info = mainData.shift();
        datasets.push({
          label: info.info,
          data: [info.stat, (100 - info.stat)],
          backgroundColor: [info.color, neutralColor],
          hoverBackgroundColor: [info.color, neutralColor],
          borderWidth: 0,
          weight: 1.25,
        });
      } else {
        datasets.push({  weight: 1.25 });
      }
    }

    setTimeout(function() {
      const progressChartInit = new Chart(progressChart, {
        type: 'ProgressDonut',
        data: {
          datasets: datasets
        },
        options: {
          responsive: true,
          cutout: '75%',
          plugins: {
            tooltip: {
              enabled: false,
            },
          }
        }
      });
    }, 200);
  },

  // 3. Stacked Bar With Line Chart - takes in an array of [x-name, [data-y1, data-y2 ...]] - 115 lines
  StackedBarWithLineChart: function(options) {
    var $ = jQuery;
    var $this = $(this);
    $this.addClass('stacked-bar-line-chart chart-card');

    // title and timestamp
    var meta = createMeta(options.timestamp, options.title);
    $this.append(meta);

    var chartContent = $('<div class="chart-content"></div>');
    var chart = $('<div class="chart"></div>');
    // chart section - dont do anything first until all DOM is settled
    var chartCanvas = $('<canvas></canvas>');
    chart.append(chartCanvas);
    chartContent.append(chart);

    // process data to fit
    var displayData = {};
    var mainData = options.data;
    // get x-axis
    displayData.labels = mainData.labels ? mainData.labels : [];
    // the total line to be generated
    var totalData = new Array(displayData.labels.length);
    for(let i=0; i<displayData.labels.length; i++) totalData[i] = 0;
    // append each dataset as z-axis
    var datasets = mainData.datasets.map(function(zData, i) {
      if(zData.data) {
        let tempTotal = totalData.map(function(y, i) {
          return (y * 1000 + zData.data[i] * 1000) / 1000;
        })
        totalData = tempTotal;
      }
      return zData;
    });
    var hasLine = options.hasLine != false ? true : false;
    if(hasLine) {
      var lineColor = options.lineColor ? options.lineColor : '#8bce32';
      var lineLabel = options.lineLabel ? options.lineLabel : 'Total';
      datasets.unshift({
        label: lineLabel,
        type: 'line',
        borderColor: lineColor,
        borderWidth: 2,
        borderDash: [5, 3],
        data: totalData,
        radius: 1,
      })
    }
    displayData.datasets = datasets;
    var xAxisLength = displayData.labels.length;

    // Today's total
    var showToday = (options.showToday === 'false' || options.showToday === false) ? false : true;
    var todayTotal = createTodayTotal(datasets)
    if(showToday) {
      chartContent.append(todayTotal);
    }
    $this.append(chartContent);
    chart.css('max-width', 'calc(100% - ' + todayTotal.width() + 'px)');
    chart.on('visible', function() {
      chart.css('max-width', 'calc(100% - ' + todayTotal.width() + 'px)');
    })

    // legends
    var legend = createLegend(datasets, false, true);
    $this.append(legend);

    // sharing
    var sharing = createSharing();
    $this.append(sharing);
    let title = options.title ?? 'Stacked-Bar-Chart-with-Line-Trend';
    updateShare($this, title);

    let showAllXLabel = options.showAllXLabel ?? false;

    const stackedBarLineChartInit = new Chart(chartCanvas,  {
      type: /(android)/i.test(navigator.userAgent) ? 'bar' : 'Bar',
      data: displayData,
      options: {
        maxBarThickness: 10,
        barPercentage: 0.8,
        interaction: {
          intersect: false,
          mode: 'index',
          axis: 'x',
        },
        hover: { mode: null },
        scales: {
          x: {
            stacked: true,
            grid: {
              drawTicks: false,
              offset: false,
            },
            ticks: {
              autoSkip: false,
              maxRotation: showAllXLabel ? 90 : 0,
              padding: 12,
              // show 3 only ticks only
              callback: function(val, i) {
                if(showAllXLabel) return this.getLabelForValue(val);
                if(i===0||i===xAxisLength-1||i===(Math.floor(xAxisLength/2))) return this.getLabelForValue(val);
                else return '';
              }
            }
          },
          y: {
            stacked: true,
            grid: {
              drawBorder: false,
              drawTicks: false,
            },
          },
        },
      	responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: false,
            external: externalTooltipHandler
          }
        },
      }
    });

  },

  // 4. Line Trend Chart - takes in an array of [x-name, [data-y1, data-y2 ...]] -  87 lines
  LineChart: function(options) {
    var $ = jQuery;
    var $this = $(this);
    $this.addClass('line-chart chart-card');

    // title and timestamp
    var meta = createMeta(options.timestamp, options.title);
    $this.append(meta);

    var chartContent = $('<div class="chart-content"></div>');
    var chart = $('<div class="chart"></div>');
    // chart section - dont do anything first until all DOM is settled
    var chartCanvas = $('<canvas></canvas>');
    chart.append(chartCanvas);
    chartContent.append(chart);

    // process data to fit
    var displayData = {};
    var mainData = options.data;
    // get x-axis
    displayData.labels = mainData.labels ? mainData.labels : [];
    // append each dataset as z-axis
    var datasets = mainData.datasets.map(function(zData, i) {
      zData.fill = false;
      return zData;
    });
    displayData.datasets = datasets;
    var xAxisLength = displayData.labels.length;

    // Today's total
    var showToday = (options.showToday === 'false' || options.showToday === false) ? false : true;
    var todayTotal = createTodayTotal(datasets, true)
    if(showToday) {
      chartContent.append(todayTotal);
    }
    $this.append(chartContent);
    chart.css('max-width', 'calc(100% - ' + todayTotal.width() + 'px  + 6px)');
    chart.on('visible', function() {
      chart.css('max-width', 'calc(100% - ' + todayTotal.width() + 'px + 6px)');
    })

    // Legend
    if(datasets.length > 1) {
      var legend = createLegend(datasets, true, false);
      $this.append(legend);
    }

    // sharing
    var sharing = createSharing();
    $this.append(sharing);
    let title = options.title ?? 'Line-Trend-Chart';
    updateShare($this, title);

    // line indicator can only be shown if the device isn't android or only one line
    let showLine = (displayData.datasets.length === 1 || !(/(android)/i.test(navigator.userAgent))) ? 'Line' : 'line';
    let showAllXLabel = options.showAllXLabel ?? false;

    const lineChartInit = new Chart(chartCanvas,  {
      type: showLine,
      data: displayData,
      options: {
        tension: options.lineIsCurve ? 0.4 : 0.1,
        pointRadius: 1,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        hover: { mode: null },
        scales: {
          x: {
            grid: {
              drawTicks: false,
            },
            ticks: {
              autoSkip: false,
              maxRotation: showAllXLabel ? 90 : 0,
              padding: 12,
              // show 3 only ticks only
              callback: function(val, i) {
                if(showAllXLabel) return this.getLabelForValue(val);
                if(i===0||i===xAxisLength-1||i===(Math.floor(xAxisLength/2))) return this.getLabelForValue(val);
                else return '';
              }
            }
          },
        },
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: false,
            external: externalTooltipHandler
          }
        },
      }
    });
  },

  // 5. Grouped Bar With Line Chart - takes in an array of [x-name, [data-y1, data-y2 ...]] - 113 lines
  GroupedBarWithLineChart: function(options) {
    var $ = jQuery;
    var $this = $(this);
    $this.addClass('grouped-bar-line-chart chart-card');

    // title and timestamp
    var meta = createMeta(options.timestamp, options.title);
    $this.append(meta);

    var chartContent = $('<div class="chart-content"></div>');
    var chart = $('<div class="chart"></div>');
    // chart section - dont do anything first until all DOM is settled
    var chartCanvas = $('<canvas></canvas>');
    chart.append(chartCanvas);
    chartContent.append(chart);

    // process data to fit
    var displayData = {};
    var mainData = options.data;
    // get x-axis
    displayData.labels = mainData.labels ? mainData.labels : [];
    // the total line to be generated
    var totalData = new Array(displayData.labels.length);
    for(let i=0; i<displayData.labels.length; i++) totalData[i] = 0;
    // append each dataset as z-axis
    var datasets = mainData.datasets.map(function(zData, i) {
      if(zData.data) {
        let tempTotal = totalData.map(function(y, i) {
          return (y * 1000 + zData.data[i] * 1000) / 1000;
        })
        totalData = tempTotal;
      }
      return zData;
    });
    var hasLine = options.hasLine != false ? true : false;
    if(hasLine) {
      var lineColor = options.lineColor ? options.lineColor : '#8bce32';
      var lineLabel = options.lineLabel ? options.lineLabel : 'Total';
      datasets.unshift({
        label: lineLabel,
        type: 'line',
        tension: 0.4,
        borderColor: lineColor,
        borderWidth: 2,
        data: totalData,
        radius: 0,
      })
    }
    displayData.datasets = datasets;
    var xAxisLength = displayData.labels.length;

    // Today's total
    var showToday = (options.showToday === 'false' || options.showToday === false) ? false : true;
    var todayTotal = createTodayTotal(datasets);
    if(showToday) {
      chartContent.append(todayTotal);
    }
    $this.append(chartContent);
    chart.css('max-width', 'calc(100% - ' + todayTotal.width() + 'px)');
    chart.on('visible', function() {
      chart.css('max-width', 'calc(100% - ' + todayTotal.width() + 'px)');
    })

    // legends
    var legend = createLegend(datasets, false, true);
    $this.append(legend);

    // sharing
    var sharing = createSharing();
    $this.append(sharing);
    let title = options.title ?? 'Grouped-Bar-Chart-with-Line-Trend';
    updateShare($this, title);

    let showAllXLabel = options.showAllXLabel ?? false;

    const groupedBarLineChartInit = new Chart(chartCanvas,  {
      type: 'Bar',
      data: displayData,
      options: {
        maxBarThickness: 10,
        barPercentage: 0.8,
        interaction: {
          intersect: false,
          mode: 'index',
          axis: 'x',
        },
        hover: { mode: null },
        scales: {
          x: {
            grid: {
              drawTicks: false,
              offset: false,
            },
            ticks: {
              autoSkip: false,
              maxRotation: showAllXLabel ? 90 : 0,
              padding: 12,
              // show 3 only ticks only
              callback: function(val, i) {
                if(showAllXLabel) return this.getLabelForValue(val);
                if(i===0||i===xAxisLength-1||i===(Math.floor(xAxisLength/2))) return this.getLabelForValue(val);
                else return '';
              }
            }
          },
          y: {
            grid: {
              drawBorder: false,
              drawTicks: false,
            },
          },
        },
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: false,
            external: externalTooltipHandler
          }
        },
      }
    });

  },

  // 6. Donut - takes in an array of [x-name, [data-y1, data-y2 ...]]
  Donut: function(options) {
    var $ = jQuery;
    var $this = $(this);
    var dataIsPercentage = options.dataIsPercentage ?? false;
    var showPercentageDataInTooltip = options.showPercentageDataInTooltip ?? false;
    $this.addClass('progress-donut donut chart-card');
    $(window).on('resize orientationchange load', function(){
      if($this.width() > 440) {
        $this.addClass('unstack');
      } else {
        $this.removeClass('unstack');
      }
    });

    // title and timestamp
    var meta = createMeta(options.timestamp, options.title);
    $this.append(meta);

    var maxwidth = options.width ? options.width : 300;
    var chart = $('<div class="chart-content donut-info"></div>');
    // chart section - dont do anything first until all DOM is settled
    var progressChart = $('<canvas></canvas>');
    var progressChartDiv = $('<div class="donut-div" style="max-width:' + maxwidth + 'px;max-height:' + maxwidth + 'px"></div>');
    progressChartDiv.append(progressChart);
    chart.append(progressChartDiv);

    // process data and put in legend first - making sure it is just 2
    var mainData = options.data.datasets;
    var labels = mainData.map(function(i) { return i.label });

    // legends
    var information = $('<div class="progress-donut-information"></div>');
    var legendContainer = $('<div class="legend-container"></div>');
    mainData.forEach(function(stat) {
      let number = stat.data + (dataIsPercentage ? '%' : '');
      number = number + ((showPercentageDataInTooltip && (stat.percent === 0 || !!stat.percent)) ? ' (' + stat.percent + '%)' : '');
      legendContainer.append(
        '<div class="stat-item">' +
        '<div class="stat-item__circle-div">' +
        '<span class="stat-item__circle" style="background:' + stat.color + '"></span>' +
        '</div>' +
        '<span class="stat-item__info">' + stat.label + '</span>' +
        '<span class="stat-item__number">' + number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</span>' +
        '</div>'
      )
    });

    information.append(legendContainer);
    chart.append(information);
    // chart.append(legendContainer);
    $this.append(chart);

    // sharing
    var sharing = createSharing();
    $this.append(sharing);
    let title = options.title ?? 'Stacked-Bar-Chart-with-Line-Trend';
    updateShare($this, title);

    // continue process data
    var datasets = mainData.map(function(i) { return i.data });
    var colors = mainData.map(function(i) { return i.color });
    var percentages = mainData.map(function(i) { return i.percent });

    setTimeout(function() {
      const progressChartInit = new Chart(progressChart, {
        type: 'pie',
        label: labels,
        data: {
          label: labels,
          datasets: [{
            isPercentage: dataIsPercentage,
            showPercentage: showPercentageDataInTooltip,
            label: labels,
            data: datasets,
            percent: percentages,
            backgroundColor: colors,
          }]
        },
        options: {
          responsive: true,
          cutout: '40%',
          elements: {
            arc: {
              borderWidth: 0,
            }
          },
          plugins: {
            tooltip: {
              enabled: false,
              external: externalPieTooltipHandler,
            },
          }
        }
      });
    }, 200);
  },

  // Create a mobile selector - from <ul><li></li></ul>
  MobileSelector: function() {
    var $ = jQuery;
    var $this = $(this);

    var select = $('<select></select>');
    $this.children('li').each(function() {
      let displayText = $(this).text();
      let value = $(this).data('tab');
      let isActive = $(this).hasClass('active') ? 'selected' : '';
      select.append('<option value="' + value + '" ' + isActive + '>' + displayText + '</option>');
    })
    $this.before(select);
    select.niceSelect();
    select.on('change', function(e) {
      let tab = $(this).val();
      $this.find('.tab-list-item').removeClass('active');
      $this.find('.tab-list-item[data-tab="' + tab + '"]').addClass('active');
      $this.find('.tab-list-item[data-tab="' + tab + '"]').addClass('active');
      $this.closest('.tab-container').find('.tab-item-content').attr('aria-hidden', true);
      $this.closest('.tab-container').find('.tab-item-content[data-placeholder-label="' + tab + '"]').attr('aria-hidden', false);
      $this.closest('.tab-container').find('.tab-item-content[data-placeholder-label="' + tab + '"]').find('.chart').trigger('visible');
      $this.closest('.tab-container').find('.tab-item-content[data-tab="' + tab + '"]').find('.chart').trigger('visible');
      setTimeout(function() {
        $('.nice-select').removeClass('open');
      }, 10);
    });
    $this.find('.tab-list-item').on('click', function() {
      let tab = $(this).data('tab');
      $('.tab-item-content[data-placeholder-label="' + tab + '"]').find('.chart').trigger('visible');
      $('.tab-item-content[data-tab="' + tab + '"]').find('.chart').trigger('visible');
      let tabTitle = $(this).text();
      let niceSelect = select.next('.nice-select');
      niceSelect.find('.current').text(tabTitle);
      niceSelect.find('.option').removeClass('selected');
      niceSelect.find('.option[data-value="' + tab + '"]').addClass('selected');
    });
  }

});

// this is the section of the code to activate the renderings
jQuery(function($) {
  // create a mobile selector for graphs
    $('.tab-container.has-graphs').each(function () {
        $(this).find('.tab-list').MobileSelector();
    });


  // close share
  $(document).on('click', function(e) {
    let shareButton = $('.download-share-link[data-type="share-computer"] button');
    if(!shareButton.is(e.target) && shareButton.has(e.target).length === 0) {
      shareButton.next('.share-url').hide();
    }
  });

  // shared link anchor
  var graphHash = window.location.hash;
  // if it is id but very likely not used
  if(graphHash.length && $(graphHash).length && $(graphHash).closest('.tab-container.has-graphs').length) {
    let tabContainer = $(graphHash).closest('.tab-container.has-graphs');
    let tabOpener = $(graphHash).closest('.tab-item-content').data('tab');
    tabContainer.find('.tab-list-item[data-tab="' + tabOpener + '"]').click();
    $('html, body').animate({
      scrollTop: tabContainer.offset().top - $('nav.navbar-default').height() - 1.5
    });
  }

})


$(function($) {
  $('#donut').Donut({
     timestamp: 'As of 22 September 2021, 12pm',
     title: 'Moving Average of Active Cases (Last 7 Days)',
     dataIsPercentage: false,
     showPercentageDataInTooltip: true,
     data: {
       datasets: [{
         label: 'Moving Average of Active Cases (Last 7 Days)',
         color: '#8bce32',
         data: 4414,
         percent: 0.3,
       },{
         label: 'blue3',
         color: '#05CDE8',
         data: 2512.5,
         percent: 1.03,
       },{
         label: 'purple3',
         color: '#A474E8',
         data: 215,
         percent: 1.0,
       },{
         label: 'red3',
         color: '#E016D6',
         data: 104,
         percent: 0.0,
       }]
     }
   });

    // 5. Grouped Bar chart with line trend
    $('#local-cases-trend').GroupedBarWithLineChart({
    timestamp: 'As of 22 September 2021, 2pm',
    title: 'Local Cases Line Trend',
    // Despite the name of the chart, the line showing total trend can be removed by specifying false (default: true)
    hasLine: true,
    lineLabel: 'Total Cases',
    lineColor: '#8bce32',
    data: {
      // x-axis - the date of trend from left to right (oldest to newest) - has no particular format and will display the string as it is
      labels: ['24/10/2021','25/10/2021','26/10/2021','27/10/2021','28/10/2021','29/10/2021','30/10/2021','31/10/2021','1/11/2021','2/11/2021','3/11/2021','4/11/2021','5/11/2021','6/11/2021','7/11/2021','8/11/2021','9/11/2021','10/11/2021','11/11/2021','12/11/2021','13/11/2021','14/11/2021','15/11/2021','16/11/2021','17/11/2021','18/11/2021','19/11/2021','20/11/2021'],
      datasets: [{
        label: '70+ years old',
        backgroundColor: '#1d4e89',
        data: [184,194,200,293,241,224,170,248,177,227,241,214,131,223,204,172,208,221,187,215,168,155,156,158,229,143,124,167]
      },{
        label: '61-70 years old',
        backgroundColor: '#079fff',
        data: [270,263,306,435,304,335,238,283,230,311,294,257,153,278,221,183,305,285,183,264,220,152,167,197,277,151,145,166]
      },{
        label: '40-60 years old',
        backgroundColor: '#da8bff',
        data: [928,939,1067,1591,1116,1276,919,953,711,1181,1060,902,506,1014,711,740,1116,1018,668,908,672,507,607,666,1031,620,504,560]
      },{
        label: '19-30 years old',
        backgroundColor: '#2fdfdf',
        data: [1028,1075,1093,1733,1111,1410,960,990,778,1239,1177,1038,636,1024,913,883,1231,1204,810,1156,807,606,755,679,1295,732,633,727]
      },{
        label: '12-18 years old',
        backgroundColor: '#ffae63',
        data: [103,104,96,182,131,153,98,77,85,121,138,110,69,120,93,90,132,169,130,118,87,75,73,107,145,99,71,83]
      },{
        label: '0-11 years old',
        backgroundColor: '#f72585',
        data: [196,267,222,416,271,309,225,194,208,273,314,259,143,269,201,239,230,346,265,304,225,156,206,214,343,219,156,164]
      }]
    }
  });

    // 4. Line Trend Charts
  $('#weekly-infections').LineChart({
    timestamp: 'As of 22 September 2021, 2pm',
    title: 'Community Cases by Age Group',
    lineIsCurve: true,
    data: {
      labels: ['21/9/2021','22/9/2021','23/9/2021','24/9/2021','25/9/2021','26/9/2021','27/9/2021','28/9/2021','29/9/2021','30/9/2021','1/10/2021','2/10/2021','3/10/2021','4/10/2021','5/10/2021','6/10/2021','7/10/2021','8/10/2021','9/10/2021','10/10/2021','11/10/2021','12/10/2021','13/10/2021','14/10/2021','15/10/2021','16/10/2021','17/10/2021','18/10/2021','19/10/2021','20/10/2021','21/10/2021','22/10/2021','23/10/2021','24/10/2021','25/10/2021','26/10/2021','27/10/2021','28/10/2021','29/10/2021','30/10/2021','31/10/2021','1/11/2021','2/11/2021','3/11/2021','4/11/2021','5/11/2021','6/11/2021','7/11/2021','8/11/2021','9/11/2021','10/11/2021','11/11/2021','12/11/2021','13/11/2021','14/11/2021','15/11/2021','16/11/2021','17/11/2021','18/11/2021','19/11/2021','20/11/2021'],
      datasets: [{
        label: 'Weekly Infections Rate',
        borderColor: '#8bce32',
        data: [1.78,1.71,1.65,1.63,1.52,1.5,1.5,1.54,1.5,1.53,1.52,1.61,1.5,1.49,1.5,1.53,1.49,1.46,1.43,1.46,1.4,1.29,1.18,1.1,1.05,0.99,0.97,0.97,1.02,1.06,1.11,1.12,1.14,1.14,1.18,1.11,1.15,1.13,1.15,1.14,1.12,1.05,1.09,0.96,0.93,0.81,0.83,0.81,0.84,0.82,0.88,0.87,1.04,0.98,0.97,0.94,0.88,0.89,0.9,0.77,0.78]
      }]
    }
  });
  $('#seven-day-active').LineChart({
    timestamp: 'As of 22 September 2021, 12pm',
    title: 'Moving Average of Active Cases (Last 7 Days)',
    data: {
      labels: ['7/11/2021','8/11/2021','9/11/2021','10/11/2021','11/11/2021','12/11/2021','13/11/2021','14/11/2021','15/11/2021','16/11/2021','17/11/2021','18/11/2021','19/11/2021','20/11/2021'],
      datasets: [{
        label: 'In ICU, Fully Vaccinated',
        borderColor: '#8bce32',
        data: [0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.6,0.6,0.6,0.6,0.6,0.5]
      },{
        label: 'In ICU, Non-Fully Vaccinated',
        borderColor: '#079fff',
        data: [5.1,5.2,5.2,5.3,5.3,5.4,5.4,5.4,5.4,5.4,5.2,5,4.9,4.8]
      },{
        label: 'Deceased, Fully Vaccinated',
        borderColor: '#da8bff',
        data: [0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1]
      },{
        label: 'Deceased, Non-Fully Vaccinated',
        borderColor: '#f72585',
        data: [1,1,1,1,1,1,0.9,0.9,1,1,1,1,0.9,1]
      }]
    }
  });

    // 3. Stacked Bar chart with line trend
  $('#hospitalised').StackedBarWithLineChart({
    timestamp: 'As of 22 September 2021, 2pm',
    title: 'Community Cases by Age Group',
    // Despite the name of the chart, the line showing total trend can be removed by specifying false (default: true)
    hasLine: true,
    lineLabel: 'Total Cases',
    lineColor: '#8bce32',
    data: {
      // x-axis - the date of trend from left to right (oldest to newest) - has no particular format and will display the string as it is
      labels: ['24/10/2021','25/10/2021','26/10/2021','27/10/2021','28/10/2021','29/10/2021','30/10/2021','31/10/2021','1/11/2021','2/11/2021','3/11/2021','4/11/2021','5/11/2021','6/11/2021','7/11/2021','8/11/2021','9/11/2021','10/11/2021','11/11/2021','12/11/2021','13/11/2021','14/11/2021','15/11/2021','16/11/2021','17/11/2021','18/11/2021','19/11/2021','20/11/2021'],
      // an array of x-axis data that fills up the chart - this array length is the number of z-axis
      // label - the z-axis (that stacks)
      // backgroundColor - the colour to fill up the z-axis column
      // data - the array of corresponding y-axis numbers to raise for each column - the length of this array MUST match the x-axis length
      // Simply put, in this example, the first data 184 (y) corresponds to 70+ years old (z) at 24/10/2021 (x)
      datasets: [{
        label: '70+ years old',
        backgroundColor: '#1d4e89',
        data: [184,194,200,293,241,224,170,248,177,227,241,214,131,223,204,172,208,221,187,215,168,155,156,158,229,143,124,167]
      },{
        label: '61-70 years old',
        backgroundColor: '#079fff',
        data: [270,263,306,435,304,335,238,283,230,311,294,257,153,278,221,183,305,285,183,264,220,152,167,197,277,151,145,166]
      },{
        label: '40-60 years old',
        backgroundColor: '#da8bff',
        data: [928,939,1067,1591,1116,1276,919,953,711,1181,1060,902,506,1014,711,740,1116,1018,668,908,672,507,607,666,1031,620,504,560]
      },{
        label: '19-30 years old',
        backgroundColor: '#2fdfdf',
        data: [1028,1075,1093,1733,1111,1410,960,990,778,1239,1177,1038,636,1024,913,883,1231,1204,810,1156,807,606,755,679,1295,732,633,727]
      },{
        label: '12-18 years old',
        backgroundColor: '#ffae63',
        data: [103,104,96,182,131,153,98,77,85,121,138,110,69,120,93,90,132,169,130,118,87,75,73,107,145,99,71,83]
      },{
        label: '0-11 years old',
        backgroundColor: '#f72585',
        data: [196,267,222,416,271,309,225,194,208,273,314,259,143,269,201,239,230,346,265,304,225,156,206,214,343,219,156,164]
      }]
    }
  });


  // 2. Progess Donut charts
    $('#severity-check').ProgressDonut({
    timestamp: 'As of 22 September 2021, 2pm',
    title: 'Cases by Severity (Last 28 days)',
    donutColor: '#e0f0f8',
    data: [
      {
        'info': 'Asymptomatic / Mild Symptoms',
        'stat': 97.9,
        'color': '#2fabf5',
        'breakdown': [
          {
            'info': 'Asymptomatic',
            'stat': 90.0,
          }, {
            'info': 'Little Symptoms',
            'stat': 4.5,
          }, {
            'info': 'On House Care',
            'stat': 1.4
          }, {
            'info': 'Mild Symptoms',
            'stat': 2.0,
          }
        ]
      }, {
        'info': 'Severe Condition',
        'stat': 2.1,
        'color': '#ff816f',
        'breakdown': [
          {
            'info': 'Been in ICU',
            'stat': 0.2,
          }, {
            'info': 'Required Oxygen Supplementation',
            'stat': 1.8,
          }, {
            'info': 'Deceased',
            'stat': 0.1,
          }
        ]
      }
    ],
  });

  $('#severity-risk').ProgressDonut({
    timestamp: 'As of 1203 September 2021, 2pm',
    title: 'Risks by Severity (Last 28 days)',
    donutColor: '#e0f0f8',
    data: [
      {
        'info': 'Asymptomatic / Mild Symptoms',
        'stat': 97.9,
        'color': '#ff816f',
        'breakdown': [
          {
            'info': 'Asymptomatic',
            'stat': 90.0,
          }, {
            'info': 'Little Symptoms',
            'stat': 4.5,
          }, {
            'info': 'On House Care',
            'stat': 1.4
          }, {
            'info': 'Mild Symptoms',
            'stat': 2.0,
          }
        ]
      }
    ]
  });


  // 1. Vaccination Progress - title, neutralColor and data (info, stat, color)
  $('#vaccination-progress').ProgressBox({
    title: 'Vaccination Progress',
    neutralColor: '#cccccc',
    data: [
      {
        'info': 'Completed full regimen',
        'stat': 82,
        'color': '#2567cb'
      }, {
        'info': 'Received booster shot',
        'stat': 15,
        'color': '#ff7b0a'
      }, {
        'info': 'Received at least one dose',
        'stat': 85,
        'color': '#444e62'
      },
    ]
  });
});
//



