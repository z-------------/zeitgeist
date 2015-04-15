/* basic functions */

var zpad = function(str, len){
    if (typeof str !== "string") str = str.toString();
    return (new Array(len + 1).join("0") + str).slice(- len);
};

Array.prototype.append = function(arr){
    return [].push.apply(this, arr);
};

HTMLElement.prototype.hide = function(){
    return this.setAttribute("hidden", "true");
};

HTMLElement.prototype.show = function(){
    return this.removeAttribute("hidden");
};

NodeList.prototype.each = function(callback){
    return [].slice.call(this).forEach(callback);
};

/* time functions */

var time = {};

time.parse = function(str){
    // time since start of day. accepts 24 hour time in 23:59 format
    var strSplit = str.split(":");
    
    var hrInt = strSplit[0];
    var minInt = strSplit[1];
    
    var msInt = hrInt * 60 * 60 * 1000 + minInt * 60 * 1000;
    
    return msInt;
};

time.sinceZero = function(){
    // returns number in milliseconds since start of day
    var now = new Date();
    return (
        now.getHours() * 60 * 60 * 1000
        + now.getMinutes() * 60 * 1000
        + now.getMilliseconds()
    );
};

time.stringify = function(ms){
    // returns 24 hour formatted time string
    // ms is time since start of day
    var dec = ms / 1000 / 60 / 60;
    var hr = Math.floor(dec);
    var minDec = dec - hr;
    var min = 60 * minDec;
    return [hr, zpad(min, 2)].join(":");
};

/* define globals */

var zeit = {};
zeit.LOCALSTORAGE_VARNAME = "zeitgeist_table";

/* define elements */

var editor = {};
editor.container = document.querySelector(".editor");
editor.table = editor.container.querySelector(".editor_week");
editor.saveBtn = editor.container.querySelector(".editor_save");

/* zeitgeist is go */

if (!localStorage.getItem(zeit.LOCALSTORAGE_VARNAME)) {
    editor.container.show();
} else {
    zeit.table = JSON.parse(localStorage.getItem(zeit.LOCALSTORAGE_VARNAME));
    console.log(zeit);
}

/* initialize editor */

for (var d = 0; d < 7; d++) {
    var dayElem = document.createElement("tr");
    dayElem.classList.add("editor_day");
    for (var p = 0; p < 5; p++) {
        var periodElem = document.createElement("td");
        periodElem.classList.add("editor_period");
        periodElem.innerHTML = "<input type='text' class='editor_period_name' placeholder='Period name'>";
        periodElem.querySelector(".editor_period_name").value = (zeit.table[d].periods[p] ? zeit.table[d].periods[p].name : null);
        dayElem.appendChild(periodElem);
    }
    editor.table.appendChild(dayElem);
}

editor.saveBtn.addEventListener("click", function(){
    // save table contents into localStorage
    var table = [];
    
    var rows = editor.table.querySelectorAll("tr");
    rows.each(function(row, i){
        var day = {};
        day.index = i;
        day.periods = [];
        
        var tds = row.querySelectorAll("td");
        tds.each(function(elem){
            var nameInput = elem.querySelector("input");
            
            var period = {
                time: "00:00",
                name: nameInput.value
            };
            
            day.periods.push(period);
        });
        
        table.push(day);
    });
    
    localStorage.setItem(zeit.LOCALSTORAGE_VARNAME, JSON.stringify(table));
});