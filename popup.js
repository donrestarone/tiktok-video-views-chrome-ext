// Initialize butotn with users's prefered color
let trigger = document.getElementById("trigger");

chrome.storage.sync.get("color", ({ color }) => {
  trigger.style.backgroundColor = color;
});

// When the button is clicked, inject calculateVideoViews into current page
trigger.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: calculateVideoViews,
  });
});



// The body of this function will be execuetd as a content script inside the
// current page
function calculateVideoViews() {
  function is_numeric(string) {
    for(var i = 0; i < string.length; i++) {
        if(string.charAt(i) < '0' || string.charAt(i) > '9') {
            return false;
        }
    }
    return true;
  }

  function charValueMultiplier(letter) {
    switch(letter) {
        case 'M':
        case 'm': return 1000000;
        case 'k':
        case 'K': return 1000;
        default: return 0;
    }
  }

  function parseNumber(string) {
    string = string.replace(/ /g, ''); // remove spaces
    var total           = 0;
    var partial         = 0;
    var partialFraction = 0;
    var fractionLength  = 0;
    var isFraction      = false;

    // process the string; update total if we find a unit character
    for(var i = 0; i < string.length; i++) {
        var c = string.substr(i, 1);
        if(c == '.' || c == ',') {
            isFraction = true;
        }
        else if(is_numeric(c)) {
            if(isFraction) {
                partialFraction = partialFraction * 10 + parseInt(c, 10);
                fractionLength++;
            }
            else {
                partial = partial * 10 + parseInt(c, 10);
            }
        }
        else {
            total += charValueMultiplier(c) * partial + charValueMultiplier(c) * partialFraction / Math.pow(10, fractionLength);

            partial         = 0;
            partialFraction = 0;
            fractionLength  = 0;
            isFraction      = false;
        }
    }

    return Math.round(total + partial + partialFraction / Math.pow(10, fractionLength));
  }

  const anchor = document.getElementsByClassName('share-info')[0]
  const videoTiles = document.getElementsByClassName('video-feed-item')
  const label = anchor.getElementsByClassName('profile')[0]
  
  let totalViews = 0
  for (let tile of videoTiles) {
    const stringified = tile.getElementsByClassName('video-count')[0].innerText
    const converted = parseNumber(stringified)
    console.log(converted)
    totalViews += converted
  }
  label.innerHTML = `with a total of ${totalViews} video views!`
}


