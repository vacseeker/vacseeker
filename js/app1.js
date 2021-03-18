// here instead of storing everything to minisearch, we store only indexes in minisearch
//and fetch docs from pouchdb
window.onload = function(){

    
var data_o = {};
// new PouchDB('foo').info().catch(console.log.bind(console));
var db_adapter;
const db = new PouchDB('data',{revs_limit: 1,  skip_setup: true });

// check if localStorage is available
if (window.localStorage){
    console.log('localStorage exists');
}
const testdb = new PouchDB('testdb')

db.info().then(function (details) {
    if (details.doc_count == 0 && details.update_seq == 0) {
        console.log ('database does not exist');
        // db.destroy().then (function() {console.log('db removed');});
    }
    else console.log('database exists!!!!!!');
    })
    .catch(function (err) {
       console.log('error: ' + err);
    return;
    });


var miniSearch;

const searchBar = document.getElementById('searchBar');
const resultDisplay = document.getElementById('resultDisplay');
const autoSuggestionsDisplay = document.getElementById('autoSuggestionsDisplay');
const searchWrapper = document.getElementsByClassName('searchWrapper')[0];



fetch('https://vacseeker.github.io/db/db.json')
  .then(response => response.json())
  .then((data) => {
      const data_o = data;             
      const keys = Object.keys(data_o);
      console.log(keys);
    //   db.bulkDocs(data_o);  
    var l = keys.length;   
    var bulkMyDoc= [] 
    for (var i=0; i<l;i++){
        var key = keys[i]
        var entry = data_o[key]
        var myDoc = {};
        if (key==="United States of America by state/territory:" ){
            subKeys = Object.keys(entry)
            // console.log(subKeys)
            subKeys.forEach(function(subKey){
                // console.log(subKey)
                myDoc._id = String(subKey)+", USA" ;
                myDoc.id = `${String(subKey)}, United States of America`;
                myDoc.flag_url = "./flags/United States.svg"

                if (subKey==="National websites"){
                    myDoc._id = "USA";
                    myDoc.id = "United States of America"
                    
                }
                
                
                myDoc.info = entry[subKey];
                // extra info field
                // myDoc.info_meta = infoMetaPopulate(entry[subKey]);
                // console.log(myDoc);
                bulkMyDoc.push(myDoc);
                myDoc = {};
            })
        }
        else{
            myDoc._id = key;
            myDoc.id =key;
            myDoc.info = entry;
            myDoc.flag_url = `./flags/${key}.svg`
            // myDoc.info_meta = infoMetaPopulate(entry);
            bulkMyDoc.push(myDoc);
            myDoc = {}
        }         
    }
    console.log(bulkMyDoc);        
    db.bulkDocs(bulkMyDoc);
    
    miniSearch = new MiniSearch({
        fields: ['id', '_id' ], // fields to index for full-text search
        storeFields: ['id', '_id'],
        

         // fields to return with search results
        searchOptions: {
            boost: { _id: 2 },
            fuzzy: 0.2,
            prefix:true
          }
      })

    // minisearch field extraction
    
    // Index all documents
    miniSearch.addAll(bulkMyDoc);      
    })
    .then(
        searchEngine()
    )

function infoMetaPopulate(inf){
    let l = inf.length;
    let info_meta = '';
    for (i=0; i < l; i++){
        entry = inf[i];
        key = Object.keys(entry)[0];
        info_meta += key;
    }
    return info_meta;
}

function searchEngine(){
    searchBar.addEventListener('keyup', (e) => {
        const searchString = e.target.value;
        
        if (e.key === 'Enter' && searchString!==''){
            autoSuggestionsDisplay.classList.add("hidden");
            removeAllChildNodes(autoSuggestionsDisplay);


            removeAllChildNodes(resultDisplay);

            let searchResults = miniSearch.search(searchString);
            // console.log(searchResults);
            searchBar.value='';
            ll = searchResults.length;
            if (ll > 0){
                for (let i=0; i<1; i++){
                    res = searchResults[i];
                    var topResult = res;
                    var resultHeading = topResult._id;
                    var resultBody = topResult.info;

                    // pouch fetch
                    fetchAndPrep(resultHeading);

                    // let [headNode, bodyNode] = createRresultNode(resultHeading, resultBody);
                    // console.log(headNode);
                    // console.log(bodyNode);
                    // resultDisplay.appendChild(headNode);
                    // resultDisplay.appendChild(bodyNode);  
                }
                        
                
            }
            else{
                var showResults = "No such found";
                resultDisplay.innerText = showResults;
            }
            
            
        }
        //basically autosuggestions on keypress
        else if (searchString!==''){
            // console.log(searchString);

            removeAllChildNodes(autoSuggestionsDisplay);
            autoSuggestionsDisplay.classList.remove("hidden");

            let autoSuggestions = miniSearch.search(searchString);
            // console.log(autoSuggestions);
            // miniSearch.search(searchString, { fuzzy: 0.2 });
            if (autoSuggestions.length > 0){
                // console.log("yes")
                autoSuggestions.forEach(function(res){
                    var topAuto = res;
                    var autoHeading = topAuto._id;
                    var autoBody = [];
                    // console.log(autoHeading);

                    flag_id = res._id;
                    if (flag_id.includes("USA")) {
                        flag_id="United States"
                    }


                    let flagUrl = "./flags/" + flag_id + ".svg"
                    let [head, body] = createRresultNode(autoHeading, autoBody, "auto-", flagUrl);
                    // console.log(head);
                    // console.log(body);
                    
                    addSearchEvent(head, res._id);
                    autoSuggestionsDisplay.appendChild(head);
                    
                    // autoSuggestionsDisplay.appendChild(body);  

                })


                // console.log(autoSuggestions);
            }
            

        }
        else{
            removeAllChildNodes(autoSuggestionsDisplay);
            autoSuggestionsDisplay.classList.add("hidden");

        }
    })

}

function addSearchEvent(nd, qStr){
    nd.addEventListener("click", function(e){
        // let qStr = nd.innerText;
        console.log("clicked " + qStr);

        autoSuggestionsDisplay.classList.add("hidden");
        removeAllChildNodes(autoSuggestionsDisplay);
        removeAllChildNodes(resultDisplay);

        let searchResults = miniSearch.search(qStr);
        // qSTR here is _id, right?
        console.log(searchResults);
        searchBar.value='';
        if (searchResults.length > 0){
                // res = searchResults[0];            
                // var topResult = res;

                var resultHeading = qStr;
                // var resultBody = topResult.info;
                //instead of .info how about fetch the relevant doc from pouchdb by the ._id field
                fetchAndPrep(resultHeading);
                
                // let [headNode, bodyNode] = createRresultNode(resultHeading, resultBody);
                // console.log(headNode);
                // console.log(bodyNode);
                // resultDisplay.appendChild(headNode);
                // resultDisplay.appendChild(bodyNode);                      
                    
            
        }
        else{
            var showResults = "No such found";
            resultDisplay.innerText = showResults;
        }


    })

}

function fetchAndPrep(id){
    db.get(id).then(function (doc) {
        // console.log(doc);
        var resultBody = doc.info;
        let flagUrl = doc.flag_url;
        console.log(flagUrl);
        console.log(doc);
        let [headNode, bodyNode] = createRresultNode(id, resultBody, "result-", flagUrl);
                // console.log(headNode);
                // console.log(bodyNode);
                resultDisplay.appendChild(headNode);
                resultDisplay.appendChild(bodyNode); 
      });
      
}

function createRresultNode(heading, body, classN, flagUrl){    
    let headNode = document.createElement('div');
    // add appropriate class name to head node
    classn_h = classN + 'Head';
    headNode.classList.add(classn_h)
    // headNode.classList.add("resultHead");

    let bodyNode = document.createElement('div');
    classn_b = classN + 'Body'
    bodyNode.classList.add(classn_b);

    
    let headImg = document.createElement('img');
    console.log(flagUrl);
    headImg.src = flagUrl;
    headImg.id = 'flag-icon';

    let headText = document.createElement('h3');
    headText.innerText = heading;

    console.log(headImg);
    headNode.appendChild(headImg);
    headNode.appendChild(headText);

    body.forEach(function(entry){
        key = Object.keys(entry)[0];
        val = entry[key];
        let aTag = document.createElement('a');
        aTag.innerText = (String(key));
        // console.log(aTag);
        aTag.href = val;
        aTag.target = "_blank";
        aTag.rel="noopener noreferrer";
        let pTag = document.createElement('p');
        pTag.appendChild(aTag);
        bodyNode.appendChild(pTag);
    })
    // console.log(bodyNode);
    // console.log(headNode);
    return [headNode, bodyNode];


} 

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}


//things end here    
}