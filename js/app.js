window.onload = function(){

    
var data_o = {};
var db = new PouchDB('data'); 
var miniSearch;

const searchBar = document.getElementById('searchBar');
const resultDisplay = document.getElementById('resultDisplay');
const autoSuggestionsDisplay = document.getElementById('autoSuggestionsDisplay');



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
                console.log(subKey)
                myDoc._id = String(subKey)+", USA" ;
                myDoc.id = String(subKey);

                if (subKey==="National websites"){
                    myDoc._id = "USA";
                    myDoc.id = "United States of America"
                }
                
                
                myDoc.info = entry[subKey];
                console.log(myDoc);
                bulkMyDoc.push(myDoc);
                myDoc = {};
            })
        }
        else{
            myDoc._id = key;
            myDoc.id =key;
            myDoc.info = entry;
            bulkMyDoc.push(myDoc);
            myDoc = {}
        }         
    }
    console.log(bulkMyDoc);        
    db.bulkDocs(bulkMyDoc); 
    miniSearch = new MiniSearch({
        fields: ['id', 'info', '_id'], // fields to index for full-text search
        storeFields: ['_id','id', 'info', ], // fields to return with search results
        searchOptions: {
            // boost: { _id: 2 },
            fuzzy: 0.2,
            prefix:true
          }
      })
    // Index all documents
    miniSearch.addAll(bulkMyDoc);      
    })
    .then(
        searchEngine()
    )

function searchEngine(){
    searchBar.addEventListener('keyup', (e) => {
        const searchString = e.target.value;
        
        if (e.key === 'Enter' && searchString!==''){
            autoSuggestionsDisplay.classList.add("hidden");
            removeAllChildNodes(autoSuggestionsDisplay);


            removeAllChildNodes(resultDisplay);

            let searchResults = miniSearch.search(searchString);
            console.log(searchResults);
            searchBar.value='';
            if (searchResults.length > 0){
                searchResults.forEach(function(res){
                    var topResult = res;
                    var resultHeading = topResult._id;
                    var resultBody = topResult.info;

                    let [headNode, bodyNode] = createRresultNode(resultHeading, resultBody);
                    console.log(headNode);
                    console.log(bodyNode);
                    resultDisplay.appendChild(headNode);
                    resultDisplay.appendChild(bodyNode);  
                })
                        
                
            }
            else{
                var showResults = "No such found";
                resultDisplay.innerText = showResults;
            }
            
            
        }
        else if (searchString!==''){
            console.log(searchString);

            removeAllChildNodes(autoSuggestionsDisplay);
            autoSuggestionsDisplay.classList.remove("hidden");

            let autoSuggestions = miniSearch.search(searchString);
            console.log(autoSuggestions);
            // miniSearch.search(searchString, { fuzzy: 0.2 });
            if (autoSuggestions.length > 0){
                console.log("yes")
                autoSuggestions.forEach(function(res){
                    var topAuto = res;
                    var autoHeading = topAuto._id;
                    var autoBody = [];
                    console.log(autoHeading);

                    let [head, body] = createRresultNode(autoHeading, autoBody);
                    console.log(head);
                    // console.log(body);
                    addSearchEvent(head, res.id);
                    autoSuggestionsDisplay.appendChild(head);
                    // autoSuggestionsDisplay.appendChild(body);  

                })


                console.log(autoSuggestions);
            }
            

        }
        else{
            removeAllChildNodes(autoSuggestionsDisplay);
            autoSuggestionsDisplay.classList.remove("hidden");

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
        console.log(searchResults);
        searchBar.value='';
        if (searchResults.length > 0){
                res = searchResults[0];            
                var topResult = res;
                var resultHeading = topResult._id;
                var resultBody = topResult.info;

                let [headNode, bodyNode] = createRresultNode(resultHeading, resultBody);
                console.log(headNode);
                console.log(bodyNode);
                resultDisplay.appendChild(headNode);
                resultDisplay.appendChild(bodyNode);          
                    
            
        }
        else{
            var showResults = "No such found";
            resultDisplay.innerText = showResults;
        }


    })

}

function createRresultNode(heading, body){
    let headNode = document.createElement('h2');
    headNode.classList.add("resultHead");
    let bodyNode = document.createElement('div');
    bodyNode.classList.add("resultBody");
    headNode.innerText = heading;
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
    console.log(bodyNode);
    console.log(headNode);
    return [headNode, bodyNode];


} 

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}


//things end here    
}
