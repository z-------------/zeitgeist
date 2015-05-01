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

(function(){
    function setRequired(elem) {
        var timeElem = elem.querySelector(".editor_period_time");
        var nameElem = elem.querySelector(".editor_period_name");
        
        if (nameElem.value && nameElem.value.length > 0) {
            timeElem.setAttribute("required", "true");
        } else {
            timeElem.removeAttribute("required");
        }
    }
    
    function setTimeMin(elem) {
        console.log(elem);
        
        if (elem) {
            var dayElem = elem.parentElement;
            var timeElem = elem.querySelector(".editor_period_time");
            var nameElem = elem.querySelector(".editor_period_name");

            var prevPeriod = dayElem.querySelectorAll(".editor_period")[[].slice.call(dayElem.querySelectorAll(".editor_period")).indexOf(elem)-1];

            if (prevPeriod && prevPeriod.querySelector(".editor_period_time").value && prevPeriod.querySelector(".editor_period_time").value.length > 0) {
                timeElem.setAttribute("min", prevPeriod.querySelector(".editor_period_time").value);
            } else if (!prevPeriod) {
                timeElem.value = "07:00";
            }
        }
    }
    
    for (var d = 0; d < 7; d++) {
        var dayElem = document.createElement("tr");
        dayElem.classList.add("editor_day");
        for (var p = 0; p < 5; p++) {
            var periodElem = document.createElement("td");
            periodElem.classList.add("editor_period");
            periodElem.innerHTML = "<input type='text' class='editor_period_name' placeholder='Period name'>\
    <input type='time' class='editor_period_time'>";

            periodElem.querySelector(".editor_period_name").value = (zeit.table[d].periods[p] ? zeit.table[d].periods[p].name : null);

            periodElem.querySelector(".editor_period_name").addEventListener("change", function(){
                setRequired(this.parentElement);
            });
            
            periodElem.querySelector(".editor_period_time").addEventListener("change", function(){
                setTimeMin(this.parentElement.parentElement.children[[].slice.call(this.parentElement.parentElement.children).indexOf(this.parentElement) + 1]);
            });

            dayElem.appendChild(periodElem);
            
            setRequired(periodElem);
            setTimeMin(periodElem);
        }
        editor.table.appendChild(dayElem);
    }
})();

editor.container.addEventListener("submit", function(e){
    e.preventDefault();
    
    if (editor.container.checkValidity()) {
        // save table contents into localStorage
        var table = [];

        var rows = editor.table.querySelectorAll("tr");
        rows.each(function(row, i){
            var day = {};
            day.index = i;
            day.periods = [];

            var tds = row.querySelectorAll("td");
            tds.each(function(elem){
                var nameInput = elem.querySelector(".editor_period_name");
                var timeInput = elem.querySelector(".editor_period_time");

                var period = {
                    time: timeInput.value,
                    name: nameInput.value
                };

                day.periods.push(period);
            });

            table.push(day);
        });

        localStorage.setItem(zeit.LOCALSTORAGE_VARNAME, JSON.stringify(table));
    }
});