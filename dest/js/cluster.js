// DATA-PROCESSING
// Get max of number
function getMax(jsonData, prop) {
  var max = 0;
  jsonData.forEach(item => {
    max = (max < item[prop]) ? item[prop] : max;
  });
  return max;
}
// Get Imported or Local Cases Data: json -> importLocal numbers
function getImportLocal(jsonData) {
  var importLocal = {'Local': {}, 'Imported': {}};
  jsonData.forEach(item => {
    if(item.Imported_o.toLowerCase() == 'imported' || item.Imported_o.toLowerCase() == 'local'){
      importLocal[item.Imported_o]['number'] = importLocal[item.Imported_o]['number'] != null ? importLocal[item.Imported_o]['number'] + 1 : 1;
      if(item.Status.toLowerCase() == 'discharged'){
        importLocal[item.Imported_o]['discharged'] = importLocal[item.Imported_o]['discharged'] != null ? importLocal[item.Imported_o]['discharged'] + 1 : 1;
      }
      if(item.Status.toLowerCase() == 'deceased'){
        importLocal[item.Imported_o]['deceased'] = importLocal[item.Imported_o]['deceased'] != null ? importLocal[item.Imported_o]['deceased'] + 1 : 1;
      }
    }
  });
  rearrangeImportLocal = [];
  for(var type in importLocal){
    var newType = {};
    newType['type'] = type;
    newType['number'] = importLocal[type]['number'];
    newType['discharged'] = importLocal[type]['discharged'];
    newType['deceased'] = importLocal[type]['deceased'];
    newType['color'] = type.toLowerCase() == 'imported' ? '#00486b' : '#FF0900';
    rearrangeImportLocal.push(newType);
  }
  return rearrangeImportLocal;
}
// Get Local Clusters Case Data: json -> localClusters
function getLocalClusters(jsonData) {
  var localClusters = {};
  jsonData.forEach(item => {
    if(item.Imported_o.toLowerCase() == 'local'){
      var cluster = item.Loc_Cluster.toLowerCase().replace(/\s+/, '+');
      if(cluster in localClusters){
        localClusters[cluster]['number'] = localClusters[cluster]['number'] + 1;
      } else {
        localClusters[cluster] = {'number':1};
      }
      if(item.Status.toLowerCase() == 'discharged'){
        localClusters[cluster]['discharged'] = localClusters[cluster]['discharged'] != null ? localClusters[cluster]['discharged'] + 1 : 1;
      }
      if(item.Status.toLowerCase() == 'deceased'){
        localClusters[cluster]['deceased'] = localClusters[cluster]['deceased'] != null ? localClusters[cluster]['deceased'] + 1 : 1;
      }
    }
  });
  rearrangeLocalClusters = [];
  for(var cluster in localClusters){
    var newCluster = {};
    newCluster['cluster'] = cluster.split('+').map(function(word){
      return (word.charAt(0).toUpperCase() + word.slice(1))
    }).join(' ');
    newCluster['number'] = localClusters[cluster]['number'];
    newCluster['discharged'] = localClusters[cluster]['discharged'];
    newCluster['deceased'] = localClusters[cluster]['deceased'];
    rearrangeLocalClusters.push(newCluster);
  }
  return rearrangeLocalClusters;
}
// Get Imported Cases Data: json -> cases
function getImportedCases(jsonData) {
 var cases = [];
 jsonData.forEach(item => {
   if(item.Imported_o.toLowerCase() == 'imported') {
     cases.push(item);
   }
 });
 return cases;
}
// Get Local Cluster Cases Data: cluster, json -> cases
function getLocalClusterCases(cluster, jsonData) {
  cluster = cluster.toLowerCase().replace(/\s+/, '+');
  var cases = [];
  jsonData.forEach(item => {
    if(item.Imported_o.toLowerCase() == 'local' && item.Loc_Cluster.toLowerCase().replace(/\s+/, '+') == cluster) {
      cases.push(item);
    }
  });
  return cases;
}
// Get Case Info: id, json -> case
function getCaseInfo(caseId, jsonData) {
  var caseInfo;
  jsonData.forEach(item => {
    if(item.Case_ID.trim() == caseId.trim()) {
      caseInfo = item;
    }
  });
  return caseInfo;
}

var historyStack = [];
// var page = 'landing';
function loadInfoGraph(page, caseDataLabel) {
  console.log('loading ', page, caseDataLabel);
  $('#back-link').trigger('historyWrite');
  $('#covid-cluster').empty();
  // set the dimensions and margins of the graph
  var width = $('#covid-cluster').width();
  var height = width;

  // append the svg object to the body of the page
  var svg;
  if(page == 'landing' || page == 'clusters') {
    height = page == 'landing' ? width * 0.6 : width * 1.2;
    svg = d3.select('#covid-cluster')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('margin', 'auto');
  } else {
    svg = $('#covid-cluster');
  }
  
  // Read data
  d3.json('data/covid-clean.json').then(function(covidFull) {
    // Page 1: Import / Local
    if(page == 'landing'){
      var importLocal = getImportLocal(covidFull);
      var maxIl = getMax(importLocal, 'number');
      var ilSize = d3.scaleLinear()
        .domain([0, maxIl])
        .range([0, width/4.5]); // radius of circle
      // append <g>
      var ilCircleGroup = svg.selectAll('g')
        .data(importLocal)
        .enter()
        .append('g')
        .attr('id', d => d.type);
      // append <circle>
      ilCircleGroup.append('circle')
        .attr('class', 'node')
        .attr('r', d => ilSize(d.number))
        .attr('cx', width / 2)
        .attr('cy', height / 2)
        .style('fill', d => d.color)
        .style('fill-opacity', 0.8)
        .attr('stroke', 'black')
        .style('stroke-width', 0);
      // append <text>
      var ilText = ilCircleGroup.append('text')
        .attr('y', height / 2)
        .attr('fill', 'white')
        .attr('font-size', '1.4em');
      ilText.append('tspan')
        .text(d => d.type)
        .attr('text-anchor', 'middle');
      ilText.append('tspan')
        .text(d => 'No. of cases: ' + d.number)
        .attr('text-anchor', 'middle')
        .attr('dy', '1.2em');
      ilText.append('tspan')
        .text(d => 'Discharged cases: ' + d.discharged)
        .attr('text-anchor', 'middle')
        .attr('dy', '1.3em');
      ilText.append('tspan')
        .text(d => 'Death cases: ' + d.deceased)
        .attr('text-anchor', 'middle')
        .attr('dy', '1.4em');
      // separate the circle
      var simulation = d3.forceSimulation()
        .force("center", d3.forceCenter().x(width / 2).y(height / 2)) // Attraction to the center of the svg area
        .force("collide", d3.forceCollide().strength(1).radius(function(d){ return ilSize(d.number) })) // Force that avoids circle overlapping
      simulation.nodes(importLocal).on("tick", function(d){
        ilCircleGroup.selectAll('circle').attr("cx", d => d.x);
        ilCircleGroup.selectAll('text, tspan').attr('x', d => d.x);
      });
      // click action
      ilCircleGroup.on('click', function() {
        historyStack.push(['landing', '']);
        if($(this).attr('id').toLowerCase() == 'local') {
          loadInfoGraph('clusters');
          // $(location).attr('href', 'clusters.html');
        } else {
          loadInfoGraph('cases', 'imported');
          // $(location).attr('href', 'cases.html#Imported');
        }
      });
    } else if(page == 'clusters'){
      // Page 2: Local Clusters
      var localClusters = getLocalClusters(covidFull);
      var maxLc = getMax(localClusters, 'number');
      var lcSize = d3.scaleLinear()
        .domain([0, maxLc])
        .range([0, width/4.5]); // radius of circle
      var lcColor = d3.scaleLinear()
        .domain([0, 200])
        .range(['#6ece58', 'rgb(221, 35, 120)']);
      // append <g>
      var lcCircleGroup = svg.selectAll('g')
        .data(localClusters)
        .enter()
        .append('g')
        // .attr('id', d => d.cluster.toLowerCase().replace(/\s+/, '+'));
        .attr('id', d => d.cluster);
      // append <circle>
      lcCircleGroup.append('circle')
        .attr('class', 'node')
        .attr('r', d => lcSize(d.number))
        .attr('cx', width / 2)
        .attr('cy', height / 2)
        .style('fill', d => lcColor(d.number))
        .style('fill-opacity', 0.8)
        .attr('stroke', 'black')
        .style('stroke-width', 0);
      // append <text>
      var lcText = lcCircleGroup.append('text')
        .attr('y', height / 2)
        .attr('fill', 'white')
        .attr('font-size', '1.4em');
      lcText.append('tspan')
        .text(d => d.cluster)
        .attr('text-anchor', 'middle')
        .attr('dy', '-1.8em');
      lcText.append('tspan')
        .text(d => 'No. of cases:' + d.number)
        .attr('text-anchor', 'middle')
        .attr('dy', '-0.6em');
      lcText.append('tspan')
        .text(d => 'Discharged cases: ' + d.discharged)
        .attr('text-anchor', 'middle')
        .attr('dy', '0.6em');
      lcText.append('tspan')
        .text(d => d.deceased ? 'Death cases: ' + d.deceased : '')
        .attr('text-anchor', 'middle')
        .attr('dy', '1.8em');
      // separate the circle
      var simulation = d3.forceSimulation()
        .force("center", d3.forceCenter().x(width / 2).y(height / 2)) // Attraction to the center of the svg area
        .force("collide", d3.forceCollide().strength(0.5).radius(function(d){ return lcSize(d.number) })) // Force that avoids circle overlapping
      simulation.nodes(localClusters).on('tick', function(d){
        lcCircleGroup.selectAll('circle').attr('cx', d => d.x);
        lcCircleGroup.selectAll('circle').attr('cy', d => d.y);
        lcCircleGroup.selectAll('text, tspan').attr('x', d => d.x);
        lcCircleGroup.selectAll('text, tspan').attr('y', d => d.y);
      });
      // click action
      lcCircleGroup.on('click', function() {
        historyStack.push(['clusters', '']);
        loadInfoGraph('cases', $(this).attr('id'));
        // $(location).attr('href', 'cases.html#' + $(this).attr('id'));
      });
    } else {
      // Page 3: Cases
      // var caseDataLabel = $(location).attr('hash').toLowerCase().slice(1);
      var caseData;
      if(caseDataLabel == 'imported') {
        caseData = getImportedCases(covidFull);
        svg.append('<h2>Imported Cases</h2>')
      } else {
        caseData = getLocalClusterCases(caseDataLabel, covidFull);
        svg.append('<h2>'+caseDataLabel+'</h2>')
      }
      var container = $('<div class="cluster-container"></div>');
      caseData.forEach(item => {
        var caseItem = $('<div class="cluster-item"></div>');
        caseItem.attr('id', item.Case_ID);
        // Status
        var avatar = $('<div class="avatar"></div>');
        if(item.Status.toLowerCase() == 'discharged') {
          avatar.css('background-color', '#41F54A');
        } else if (item.Status.toLowerCase() == 'deceased') {
          avatar.css('background-color', '#aaa');
        }
        // Gender & Status
        if(item.Gender == 'M') {
          avatar.append('<img src="img/male.svg" alt="male patient" />');
        } else {
          avatar.append('<img src="img/female.svg" alt="female patient" />');
        }
        caseItem.append(avatar);
        // Case number
        caseItem.append('<p>Case #' + item.Case_ID + '</p>');
        caseItem.on("click", function() {
          var caseInfo = getCaseInfo(item.Case_ID, caseData);
          // Setup case info container with title
          $('#case-number').text('Case #' + caseInfo.Case_ID);
          $('#case-info').empty();
          // add Age, Gender, Nationality
          $('#case-info').append('<tr><td>Age</td><td>' + caseInfo.Age + '</td></tr>')
          $('#case-info').append('<tr><td>Gender</td><td>' + caseInfo.Gender + '</td></tr>')
          $('#case-info').append('<tr><td>Nationality</td><td>' + caseInfo.Nationality + '</td></tr>')
          // Status and Dates
          $('#case-info').append('<tr><td>Date of Confirmation</td><td>' + caseInfo.Date_of_Co + '</td></tr>')
          $('#case-info').append('<tr><td>Status</td><td>' + caseInfo.Status + '</td></tr>')
          if(caseInfo.Status.toLowerCase() == 'discharged') {
            $('#case-info').append('<tr><td>Date of Discharged</td><td>' + caseInfo.Date_of_Di + '</td></tr>')
          } else if (caseInfo.Status.toLowerCase() == 'deceased') {
            $('#case-info').append('<tr><td>Date of Death</td><td>' + caseInfo.Date_of_Di + '</td></tr>')
          }
          // Origin
          if(caseInfo.Imported_o.toLowerCase() == 'imported') {
            $('#case-info').append('<tr><td>Imported from </td><td>' + caseInfo.Place + '</td></tr>')
          } else if(caseInfo.Imported_o.toLowerCase() == 'local') {
            $('#case-info').append('<tr><td>Linked Cluster </td><td>' + caseInfo.Loc_Cluster + '</td></tr>')
          }
          // Press Release
          if(caseInfo.Prs_rl_URL != '' || caseInfo.Prs_rl_URL2 != '') {
            var press = '';
            if(caseInfo.Prs_rl_URL != '') {
              press = press + '<a href="' + caseInfo.Prs_rl_URL +'" target="_blank" style="display:block">Press Release 1</a>';
            }
            if(caseInfo.Prs_rl_URL2 != '') {
              press = press + '<a href="' + caseInfo.Prs_rl_URL2 +'" target="_blank" style="display:block">Press Release 2</a>';
            }
            $('#case-info').append('<tr><td>Press Releases</td><td>' + press + '</td></tr>')
          }
  
          $(".selected").removeClass("selected");
          $(this).find(".avatar").addClass("selected");
          $('.info-container').slideDown();
        });
        container.append(caseItem);
      });
      svg.append(container);
      $(".close").on("click", function() {
        $(".selected").removeClass("selected");
        $('.info-container').slideUp();
      });
    }
  });
}

$('#back-link').on('historyWrite', function() {
  if(historyStack.length) $(this).show();
  else $(this).hide();
});

$(function() {
  $('#back-link').on('historyWrite', function() {
    if(historyStack.length) $(this).show();
    else $(this).hide();
  });
  $('#back-link').on('click', function() {
    $(".close").trigger("click");
    if(historyStack.length) {
      let last = historyStack.pop();
      console.log(last);
      if(last[1] !== '') {

      } else {
        loadInfoGraph(last[0]);
      }
    }
  });
  
  loadInfoGraph('landing');
});