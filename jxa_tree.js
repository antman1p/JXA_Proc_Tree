// JXA_Tree
// by Antonio (4n7m4n) Piazza
// Twitter @antman1p
//Example Usage from Mythic:
//1. jsimport jxa_tree.js
//2. jsimport_call{"command":"printTree('standard')"}

ObjC.import('Cocoa')
ObjC.import('Foundation')
ObjC.import('stdlib')

// Bind C functions to ObjectiveC
ObjC.bindFunction('dlopen', ['void *', ['string', 'int']]);
ObjC.bindFunction('dlclose', ['int',['string']]);
ObjC.bindFunction('dlsym', ['void *', ['void *', 'string']]);
ObjC.bindFunction('malloc', ['void *', ['int']]);
ObjC.bindFunction('free', ['void *', ['void *']])
var libprocPath = '/usr/lib/libproc.dylib';
const MAXCOMLEN = 16;
const INFO_SIZE = 136;
const PROC_PIDTBSDINFO = 3;

function listActivePids() {
  const PID_T_SIZE = 4;
  var libprocHandle = Ref();
  var pids = [];

  // Get a handle to libproc.dylib
  libprocHandle = $.dlopen(libprocPath, 2);

  // Get a handle to the proc_listallpids() function in libproc
  $.dlsym(libprocHandle, 'proc_listallpids');

  // Bind the proc_listallpids() function to ObjectiveC
  ObjC.bindFunction('proc_listallpids', ['int',['void *', 'int']]);
  nil = $();

  // Get intial number of active pids
  let initialNumPids = $.proc_listallpids(nil, 0);


  // buffer length is the number of pids * the size of pid_t (4 bytes)
  let bufferlength = initialNumPids * PID_T_SIZE;

  // Memory allocate a buffer the size of bufferlength
  let buffer = $.malloc(bufferlength);

  // Returns the number of pids and populates the buffer with the pids
  let numPids = $.proc_listallpids(buffer, bufferlength);

  //Populate a JS int array of all of the active pids from the buffer
  var i;
  for (i = 0; i < bufferlength; i+=4)  {
    var hexstring = "0x" + buffer[i+3].toString(16)+buffer[i+2].toString(16)+buffer[i+1].toString(16)+buffer[i].toString(16);
    let pid = parseInt(hexstring);
    pids.push(pid);
  }

  // free allocated buffer memory
  $.free(buffer);

  // close handle to libproc.dylib
  $.dlclose(libprocHandle);

  return pids;
}



function getProcName(pid) {
  const MAXPATHLEN = 1024;
  var libprocHandle = Ref();

  // Get a handle to libproc.dylib
  libprocHandle = $.dlopen(libprocPath, 2);

  // Get a handle to the proc_listallpids() function in libproc
  $.dlsym(libprocHandle, 'proc_name');

  // Bind the proc_name() function to ObjectiveC
  ObjC.bindFunction('proc_name', ['int',['int', 'void *', 'int']]);


  let nameBuffer = $.malloc(MAXPATHLEN);
  let nameLength = $.proc_name(pid, nameBuffer, MAXPATHLEN);

  var j;
  var nameStr = "";
  for (j=0;j < nameLength; j++){
    nameStr += String.fromCharCode(nameBuffer[j]);
  }
  let name = nameStr;

  // free allocated buffer memory
  $.free(nameBuffer);


  // close handle to libproc.dylib
  $.dlclose(libprocHandle);

  return name;
}


function getProcPath(pid) {
  const MAXPATHLEN = 1024;
  var libprocHandle = Ref();

  // Get a handle to libproc.dylib
  libprocHandle = $.dlopen(libprocPath, 2);

  // Get a handle to the proc_pidpath() function in libproc
  $.dlsym(libprocHandle, 'proc_pidpath');

  // Bind the proc_listallpids() function to ObjectiveC
  ObjC.bindFunction('proc_pidpath', ['int',['int', 'void *', 'int']]);


  let pathBuffer = $.malloc(MAXPATHLEN);
  let pathLength = $.proc_pidpath(pid, pathBuffer, MAXPATHLEN);

  var j;
  var pathStr = "";
  for (j=0; j < pathLength; j++){
    pathStr += String.fromCharCode(pathBuffer[j]);

  }
  let pathname = pathStr;

  // free allocated buffer memory
  $.free(pathBuffer);

  // close handle to libproc.dylib
  $.dlclose(libprocHandle);

  return pathname;
}

function getTs(pid) {
  var libprocHandle = Ref();

  // Get a handle to libproc.dylib
  libprocHandle = $.dlopen(libprocPath, 2);

  // Get a handle to the proc_pidinfo() function in libproc
  $.dlsym(libprocHandle, 'proc_pidinfo');

  // Bind the proc_listallpids() function to ObjectiveC
  ObjC.bindFunction('proc_pidinfo', ['int',['int', 'int', 'Int64', 'void *', 'int']]);

  // allocate buffer (supposed to be proc_bsdinfo)
  let pidInfo = $.malloc(INFO_SIZE);

  // should do error checking here in case infoSize != INFO_SIZE
  let infoSize = $.proc_pidinfo(pid, PROC_PIDTBSDINFO, 0, pidInfo, INFO_SIZE);

  const buf = new ArrayBuffer(INFO_SIZE);
  const view = new DataView(buf);
  for (let i = 0; i < INFO_SIZE; i++) {
    view.setUint8(i, pidInfo[i]);
  }

  var pbi_start_tvsec = view.getUint32(120, true);

  $.dlclose(libprocHandle);

    // free pidInfo
    $.free(pidInfo);

    return pbi_start_tvsec;
  }


  function getPpid(pid) {
    var libprocHandle = Ref();

    // Get a handle to libproc.dylib
    libprocHandle = $.dlopen(libprocPath, 2);

    // Get a handle to the proc_pidinfo() function in libproc
    $.dlsym(libprocHandle, 'proc_pidinfo');

    // Bind the proc_listallpids() function to ObjectiveC
    ObjC.bindFunction('proc_pidinfo', ['int',['int', 'int', 'Int64', 'void *', 'int']]);

    // allocate buffer (supposed to be proc_bsdinfo)
    let pidInfo = $.malloc(INFO_SIZE);

    // should do error checking here in case infoSize != INFO_SIZE
    let infoSize = $.proc_pidinfo(pid, PROC_PIDTBSDINFO, 0, pidInfo, INFO_SIZE);

    const buf = new ArrayBuffer(INFO_SIZE);
    const view = new DataView(buf);
    for (let i = 0; i < INFO_SIZE; i++) {
      view.setUint8(i, pidInfo[i]);
    }

    var pbi_ppid = view.getUint32(16, true);

    $.dlclose(libprocHandle);

      // free pidInfo
      $.free(pidInfo);

      return pbi_ppid;
    }


function getResponsiblePid(pid) {
  var libquarPath = '/usr/lib/system/libquarantine.dylib'
  const MAXPATHLEN = 1024;
  var libquarHandle = Ref();
  var responsiblePid = pid
  var urpid = Ref()
  var rpid = Ref()
  var pathBuffer = $.malloc(MAXPATHLEN);
  var pathLength = $.proc_pidpath(pid, pathBuffer, MAXPATHLEN);

  // Get a handle to libquarantine.dylib
  libquarHandle = $.dlopen(libquarPath, 2);

  // Get a handle to the proc_pidinfo() function in libproc
  $.dlsym(libquarHandle, 'responsibility_get_responsible_for_pid');

  ObjC.bindFunction('responsibility_get_responsible_for_pid', ['int',['int', 'int *', 'int *', 'int *', 'string']]);

  if ($.responsibility_get_responsible_for_pid(pid, urpid, rpid, pathLength, pathBuffer) == 0) {
    responsiblePid =  rpid[0];
  }
  return responsiblePid
}


function createNodesDictionary() {
  var nodesPidDict = {};
  let pidsArray = listActivePids();

  for (let i = 0; i < pidsArray.length; i++) {
     if (pidsArray[i] != 0) {
       var ts = ""
       var children = [];
       let procName = getProcName(pidsArray[i]);
       let procPath = getProcPath(pidsArray[i]);
       ts = getTs(pidsArray[i]);
       if (ts != 0) {
         ts = new Date(ts * 1000)
       }
       else {
         ts ="";
       }
       let ppid = getPpid(pidsArray[i]);
       let rpid = getResponsiblePid(pidsArray[i])
       var node = {
         pid: pidsArray[i],
         ppid: ppid,
         responsiblePid: rpid,
         name: procName,
         path: procPath,
         timestamp: ts,
         children: children
       };
       nodesPidDict[pidsArray[i]] = node;
     }
   }
   return nodesPidDict
}

function buildStandardTree(nodesPidDict) {
  for (let key in nodesPidDict) {
    let ppid = nodesPidDict[key].ppid;
    if (nodesPidDict[ppid]) {
      nodesPidDict[ppid].children.push(nodesPidDict[key]);
    }
  }
  let rootNode = nodesPidDict[1];
  return rootNode;
}

function buildTrueTree(nodesPidDict) {
  for (let key in nodesPidDict) {
    let rpid = nodesPidDict[key].responsiblePid;
    let pid = nodesPidDict[key].pid;
    let ppid = nodesPidDict[key].ppid;
    if (nodesPidDict[rpid] && rpid != pid) {
      nodesPidDict[rpid].children.push(nodesPidDict[key]);
    }
    else if (nodesPidDict[ppid]) {
      nodesPidDict[ppid].children.push(nodesPidDict[key]);
    }
  }
  let rootNode = nodesPidDict[1];
  return rootNode;
}

function printTree(treetype) {
  var nodes = createNodesDictionary();
  if (treetype == 'truetree') {
    var rootNode = buildTrueTree(nodes);
  }
  else {
    var rootNode = buildStandardTree(nodes);
  }
  var rootNode = buildStandardTree(nodes);
  var output = JSON.stringify(rootNode, null, 2);
  return output;
}