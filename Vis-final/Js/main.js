// This script contains the code that creates the central network, as well as
// a function for resetting it to a brand new page.

//////// bring data from  json file
var mygraph = {}
var vitual_graph = {}
var xobj = new XMLHttpRequest();
// var popcode1 = ["plantation1","truck","xyzmill","tucsonref","safeway"];

var popcode1 = [];
var first_popcode;
// bring the data from data.json 
xobj.open('GET',"data.json",true);
xobj.onreadystatechange = function () {
  if (xobj.readyState==4){
    vitual_graph = JSON.parse(xobj.responseText);
    get_popcode();
    get_graph();
  }
};
xobj.send(null);

var nodes, edges, network; //Global variables
var startpages = [];
// Tracks whether the network needs to be reset. Used to prevent deleting nodes
// when multiple nodes need to be created, because AJAX requests are async.
var needsreset = true;

var container = document.getElementById('mynetwork');
//Global options
var options = {

  width: String($('.col-sm-12').width()) + 'px',
  height: '600px',
  nodes: {
    shape: 'dot',
    scaling: { min: 20,max: 20,
      label: { min: 14, max: 30, drawThreshold: 9, maxVisible: 20 }
    },
    font: {size: 14, face: 'Helvetica Neue, Helvetica, Arial'}
  },
  interaction: {
    hover: true,
    hoverConnectedEdges: false,
    selectConnectedEdges: true,
  },
};

var nodes = new vis.DataSet();
var edges = new vis.DataSet();
var data = {nodes:nodes,edges:edges};
var initialized = false;


//Make the network
function makeNetwork() {
  network = new vis.Network(container,data,options);
  bindNetwork();
  initialized=true;
}


// Reset the network to be new each time.
function resetNetwork(start) {
  if (!initialized) makeNetwork();
  var startID = getNeutralId(start);
  startpages = [startID]; // Register the page as an origin node
  tracenodes = [];
  traceedges = [];

 
 // -- CREATE NETWORK -- //
  //Make a container
  nodes = new vis.DataSet([
    {id:startID, label:wordwrap(decodeURIComponent(start),20), value:2, level:0,
     color:getColor(0), x:0, y:0, parent:startID} //Parent is self
  ]);
  edges = new vis.DataSet();
  //Put the data in the container
  data = {nodes:nodes,edges:edges};
  network.setData(data);
}


// Add a new start node to the map.
function addStart(start, index) {
  if (needsreset) {
    // Delete everything only for the first call to addStart by tracking needsreset
    resetNetwork(start);
    needsreset = false;
    return;
  } else {
    var startID = getNeutralId(start);
    startpages.push(startID);
    nodes.add([
      {id:startID, label:wordwrap(decodeURIComponent(start),20), value:2, level:0,
      color:getColor(0), x:0, y:0, parent:startID} // Parent is self
    ]);
  }
}

var popcode1Index = 0;
var isNestle = true;
// Reset the network with the content from the input box.
function resetNetworkFromInput() {
  // Network should be reset
  needsreset = true;
  addStart(first_popcode);
  popcode1Index = 0;
  progress = 0;
  autoLoad();
  $('.progress').show();
}

var progress = 0;
function autoLoad() {
      window.setTimeout(function() {
      //   progress += 10;
      // $(".progress-bar").css('width',String(progress)+'%');
      expandNode(popcode1[popcode1Index++]);
      if (popcode1Index < popcode1.length) {
        autoLoad();
      }
      else {
        traceBack("plantation1");
        $('.progress').hide();
        
      }
    }, 500);
}


// Reset the network with content from a JSON string
function resetNetworkFromJson(data) {
  console.log('starting resetNetworkFromJson');
  if (!initialized) makeNetwork();
  var obj = networkFromJson(data);
  nodes = obj.nodes;
  edges = obj.edges;
  startpages = obj.startpages;
  // Fill the network
  network.setData({nodes:nodes, edges:edges});
  // Populate the top bar
  for (var i=0; i<startpages.length; i++) {
    addItem(document.getElementById("input"), nodes.get(startpages[i]).label);
  }
  // Transform the "go" button to a "refresh" button
  document.getElementById("submit").innerHTML = '<i class="icon ion-refresh"> </i>';
}

function get_popcode(){
  var return_val = [];
  for (x in vitual_graph){
    for (y in vitual_graph[x]){
      if (y.toLowerCase() != "othertools"){
        if (y.toLowerCase() != "plantation2"){
          return_val.push(y.toLowerCase());
        }
      }
    }
  }
  for (x in vitual_graph[0]){
    first_popcode = x
  }
  popcode1 = return_val
  console.log(popcode1)
}

// "POPlacement": ["ToolBox"],
// "ToolBox": ["ShiptheBox","OtherTool"],
// "OtherTool":[],
// "ShiptheBox": ["ReceivetheBox"],
// "ReceivetheBox": ["ToolReturnedtoTc"],
// "ToolReturnedtoTc": ["Tool"],
// // "Tool":[]

function get_graph(){
  for (x in vitual_graph){
    for (y in vitual_graph[x]){
      var return_val = []
      if (x != 0){
        return_val.push(y)
        if (mygraph[vitual_graph[x][y].Upstream] != null){
          mygraph[vitual_graph[x][y].Upstream].push(y);
        }else{
          mygraph[vitual_graph[x][y].Upstream] = return_val;
        }
      }
      
      if (x == Object.keys(vitual_graph).length - 1){
        return_val = []
        mygraph[y] = return_val
      }
    }
  }
  mygraph["plantation2"] = [];
  mygraph["othertools"] = [];
  
  console.log(mygraph)
}

function obj_length(data_obj){
  var count = 0;

  for (var x in data_obj){
    if (Object.prototype.hasOwnProperty.call(data_obj,property)){
      count++;
    }
  }
  return  count;
}