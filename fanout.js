setSleepIndicator( LED3 );

function transfer(device, text, callback) {
  var char;
  var result = "";
  console.log( "connecting " + device.name );
  return device.gatt.connect().then(function(d) {
    device = d;
    console.log( "connected" );
    return d.getPrimaryService("6e400001-b5a3-f393-­e0a9-e50e24dcca9e");
  }).then(function(s) {
    console.log( "service found" );
    return s.getCharacteristic("6e400002-b5a3-f393-­e0a9-e50e24dcca9e");
  }).then(function(c) {
    char = c;
    console.log( "characteristic found, sending..." );
    function sender(resolve, reject) {
      if (text.length) {
        char.writeValue(text.substr(0,20)).then(­function() {
          sender(resolve, reject);
        }).catch(reject);
        text = text.substr(20);
      } else  {
        console.log("finished");
        resolve();
      }
    }
    return new Promise( sender );
  }).then(function() {
    device.disconnect();
    if(callback) callback(true);
  }).catch(function() {
    console.log( "error" );
    if(callback) callback(false);
  });
}

function scan( callback ) {
  var result = [];
  NRF.findDevices(function(list) {
    for( var i = 0; i < list.length; i++ ) {
      var d = list[ i ];
      if( typeof d.name !== "undefined" && d.name.indexOf( "Puck.js" ) === 0 ) {
        console.log( "found " + d.name );
        result.push( d );
      }
    }
    callback( result );
  });
}

function spread() {
  var code = E.dumpStr();
  scan( function( queue ) {
    // recurse through queue
    function process() {
      if( queue.length ) {
          transfer( queue.pop(), code, function( result ) {
            console.log( "done" );
            setTimeout( process, 200 );
          });
      }
    }
    process();
  });
}

spread();
