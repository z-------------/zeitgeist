/* basic functions */

var zpad = function(str, len){
    if (typeof str !== "string") str = str.toString();
    return (new Array(len + 1).join("0") + str).slice(- len);
};

var max = function(n, m) {
    return (n % m === 0 ? m : n % m);
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

var zeit = {
    config: {},
};

zeit.LOCALSTORAGE_VARNAME = "zeitgeist_table";
zeit.DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
zeit.DEFAULT_START_TIME = "07:00";

zeit.saveTable = function() {
    var table = [];
        
    var weeks = editor.tables.querySelectorAll(".editor_week");
    weeks.each(function(weekElem){
        console.log(weekElem);
        var week = [];
        var rows = weekElem.querySelectorAll(".editor_day");
        rows.each(function(row, i){
            var day = {};
            day.index = i;
            day.periods = [];

            var tds = row.querySelectorAll(".editor_period");
            tds.each(function(elem){
                var nameInput = elem.querySelector(".editor_period_name");
                var timeInput = elem.querySelector(".editor_period_time");

                var period = {
                    time: timeInput.value,
                    name: nameInput.value
                };

                day.periods.push(period);
            });

            week.push(day);
        });
        table.push(week);
    });

    localStorage.setItem(zeit.LOCALSTORAGE_VARNAME, JSON.stringify(table));
};

/* define elements */

var editor = {};
editor.container = document.querySelector(".editor");
editor.tables = editor.container.querySelector(".editor_tables");
editor.saveBtn = editor.container.querySelector(".editor_save");
editor.addWeekBtn = editor.container.querySelector(".editor_add_week");

/* zeitgeist is go */

if (!localStorage.getItem(zeit.LOCALSTORAGE_VARNAME)) {
    editor.container.show();
} else {
    zeit.config.table = JSON.parse(localStorage.getItem(zeit.LOCALSTORAGE_VARNAME));
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
            }
        }
    }
    
    for (var w = 0; w < (zeit.config.table && zeit.config.table.length ? zeit.config.table.length : 1); w++) {
        var weekElem = document.createElement("table");
        weekElem.classList.add("editor_week");
        
        for (var d = 0; d < 7; d++) {
            var dayElem = document.createElement("tr");
            dayElem.classList.add("editor_day");

            dayElem.innerHTML += "<td>" + zeit.DAY_NAMES[d] + "</td>";

            for (var p = 0; p < (zeit.config.table && zeit.config.table[w] && zeit.config.table[w][d] ? zeit.config.table[w][d].periods.length : 5); p++) {
                var periodElem = document.createElement("td");
                periodElem.classList.add("editor_period");
                periodElem.innerHTML = "<input type='text' class='editor_period_name' placeholder='Period name'>\
        <input type='time' class='editor_period_time'>";

                periodElem.querySelector(".editor_period_name").value = (zeit.config.table && zeit.config.table[w][d].periods[p] ? zeit.config.table[w][d].periods[p].name : "" + d + p);
                periodElem.querySelector(".editor_period_time").value = (zeit.config.table && zeit.config.table[w][d].periods[p] ? zeit.config.table[w][d].periods[p].time : null);

                dayElem.appendChild(periodElem);

                setRequired(periodElem);
                setTimeMin(periodElem);
            }
            weekElem.appendChild(dayElem);
        }
        
        editor.tables.addEventListener("input", function(e){
            var input = e.srcElement;
            var periodElem = input.parentElement;
            
            if (input.classList.contains("editor_period_name")) {
                setRequired(periodElem);
            } else if (input.classList.contains("editor_period_time")) {
                console.log("time changed");
                setTimeMin(periodElem.parentElement.children[[].slice.call(periodElem.parentElement.children).indexOf(periodElem) + 1]);
            } else {
                console.log("not applicable", input);
            }
        });
        
        editor.tables.appendChild(weekElem);
    }
})();

editor.container.addEventListener("submit", function(e){
    e.preventDefault();
    
    if (editor.container.checkValidity()) {
        console.log("table valid, saving");
        zeit.saveTable();
        console.log("saved");
    } else {
        console.log("table not valid");
    }
});

editor.addWeekBtn.addEventListener("click", function(){
    var cloned = editor.tables.children[editor.tables.children.length - 1].cloneNode(true);
    editor.tables.appendChild(cloned);
    cloned.querySelectorAll("input").each(function(elem){
        elem.value = elem.value;
    });
});