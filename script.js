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

time.sinceZero = function(date){
    // returns number in milliseconds since start of day
    var now = date || new Date();
    return (
        now.getHours() * 60 * 60 * 1000
        + now.getMinutes() * 60 * 1000
        + now.getSeconds() * 1000
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
zeit.PERIOD_TIMES = [
    "8:40", "9:47",
    "10:50",
    "11:15",
    "12:18",
    "1:10", "2:18"
];

zeit.getWeek = function() {
    var then = zeit.lastSave.time;
    var thenWeek = zeit.lastSave.week;
    var now = new Date();
    var delta = (now - then)/1000/60/60/24;
    var weeks = Math.floor((delta + then.getDay()) / 7) + thenWeek;
    return max(weeks + 1, zeit.config.table.length) - 1;
};

zeit.getPeriod = function() {
    var now = new Date();
    var nowTime = now.getHours() * 60 * 60 * 1000
        + now.getMinutes() * 60 * 1000
        + now.getSeconds() * 1000
        + now.getMilliseconds();

    var week = zeit.config.table[zeit.getWeek()];
    var day = week[now.getDay()];

    if (!day.disabled) {
        var i = day.periods.length - 1;
        while (i >= 0) {
            var period = day.periods[i];
            var timeArr = period.time.split(":");
            var time = timeArr[0] * 60 * 60 * 1000 + timeArr[1] * 60 * 1000;
            if (nowTime >= time) {
                if (period.enable) {
                    return period;
                }
                return null;
            }
            i--;
        }
    }
    return null;
};

/* template function */

var template = {};
template.make = function(name, vars) {
    var html = document.querySelector("template[data-name='" + name + "']").innerHTML;
    if (html) {
        var keys = (vars ? Object.keys(vars) : []);
        keys.forEach(function(key){
            html = html.replace(new RegExp("{" + key + "}", "g"), vars[key].toString());
        });
        return html;
    }
    return null;
};

/* define elements */

var editor = {};
editor.container = document.querySelector(".editor");
editor.tables = editor.container.querySelector(".editor_tables");
editor.saveBtn = editor.container.querySelector(".editor_save");
editor.addWeekBtn = editor.container.querySelector(".editor_add_week");
editor.weekInput = editor.container.querySelector(".editor_weeknow");

var display = {};
display.container = document.querySelector(".display");
display.now = {};
display.now.container = display.container.querySelector(".display_now");
display.now.name = display.now.container.querySelector(".display_name");
display.configBtn = display.container.querySelector(".display_open_config");

/* zeitgeist is go */

if (!localStorage.getItem(zeit.LOCALSTORAGE_VARNAME)) {
    editor.container.show();
} else {
    zeit.config.table = JSON.parse(localStorage.getItem(zeit.LOCALSTORAGE_VARNAME));
    console.log(zeit);

    setInterval(function(){
        display.now.name.textContent = zeit.getPeriod() ? zeit.getPeriod().name : "nothing";
    }, 1000);
}

if (localStorage.getItem("zeitgeist_last_save")) {
    zeit.lastSave = JSON.parse(localStorage.getItem("zeitgeist_last_save"));
    zeit.lastSave.time = new Date(zeit.lastSave.time);
}

/* initialize editor */

(function(){
    // function setRequired(elem) {
    //     var timeElem = elem.querySelector(".editor_period_time");
    //     var nameElem = elem.querySelector(".editor_period_name");
    //
    //     if (nameElem.value && nameElem.value.length > 0) {
    //         timeElem.setAttribute("required", "true");
    //     } else {
    //         timeElem.removeAttribute("required");
    //     }
    // }
    //
    // function setTimeMin(elem) {
    //     console.log(elem);
    //     if (elem) {
    //         var dayElem = elem.parentElement;
    //         var timeElem = elem.querySelector(".editor_period_time");
    //         var nameElem = elem.querySelector(".editor_period_name");
    //
    //         var prevPeriod = dayElem.querySelectorAll(".editor_period")[[].slice.call(dayElem.querySelectorAll(".editor_period")).indexOf(elem)-1];
    //
    //         if (prevPeriod && prevPeriod.querySelector(".editor_period_time").value && prevPeriod.querySelector(".editor_period_time").value.length > 0) {
    //             timeElem.setAttribute("min", prevPeriod.querySelector(".editor_period_time").value);
    //         }
    //     }
    // }

    for (var w = 0; w < (zeit.config.table && zeit.config.table.length ? zeit.config.table.length : 1); w++) {
        var weekElem = document.createElement("table");
        weekElem.classList.add("editor_week");

        weekElem.innerHTML += template.make("weekHeader", {
            weekNo: w + 1
        });

        var timesElem = document.createElement("tr");
        timesElem.classList.add("editor_times");
        for (var p = 0; p < (zeit.config.table && zeit.config.table[w] && zeit.config.table[w][d] ? zeit.config.table[w][d].periods.length : 5); p++) {
            var timeElem = document.createElement("td");
            timeElem.classList.add("editor_time");
            timeElem.textContent = zeit.PERIOD_TIMES[p];
            timesElem.appendChild(timeElem);
        }
        weekElem.appendChild(timesElem);

        for (var d = 0; d < 7; d++) {
            var dayElem = document.createElement("tr");
            dayElem.classList.add("editor_day");
            if (zeit.config.table && zeit.config.table[w][d].disabled) {
                dayElem.classList.add("disabled");
            }

            dayElem.innerHTML += "<td class='editor_day_name'>" + zeit.DAY_NAMES[d] + "</td>";

            for (var p = 0; p < (zeit.config.table && zeit.config.table[w] && zeit.config.table[w][d] ? zeit.config.table[w][d].periods.length : 5); p++) {
                var periodElem = document.createElement("td");
                periodElem.classList.add("editor_period");
                periodElem.innerHTML = template.make("periodInput");

                periodElem.querySelector(".editor_period_name").value = (zeit.config.table && zeit.config.table[w][d].periods[p] ? zeit.config.table[w][d].periods[p].name : "" + d + p);
                // periodElem.querySelector(".editor_period_time").value = (zeit.config.table && zeit.config.table[w][d].periods[p] ? zeit.config.table[w][d].periods[p].time : null);
                // if (zeit.config.table && zeit.config.table[w][d].periods[p] && zeit.config.table[w][d].periods[p].enable === false) {
                //     periodElem.querySelector(".editor_period_enable").checked = false;
                // } else {
                //     periodElem.querySelector(".editor_period_enable").checked = true;
                // }

                dayElem.appendChild(periodElem);

                // setRequired(periodElem);
                // setTimeMin(periodElem);
            }
            weekElem.appendChild(dayElem);
        }
        editor.tables.appendChild(weekElem);
    }

    editor.tables.addEventListener("input", function(e){
        var input = e.srcElement;
        var parent = input.parentElement;

        if (input.classList.contains("editor_period_name")) {
            // setRequired(periodElem);
        } else if (input.classList.contains("editor_period_time")) {
            console.log("time changed");
            // setTimeMin(parent.parentElement.children[[].slice.call(parent.parentElement.children).indexOf(parent) + 1]);
        }
    });

    editor.tables.addEventListener("click", function(e){
        var input = e.srcElement;
        var parent = input.parentElement;

        if (input.classList.contains("editor_week_remove")) {
            parent.parentElement.parentElement.removeChild(parent.parentElement);

            var weekElemHeaders = editor.container.querySelectorAll(".editor_week_header");
            weekElemHeaders.each(function(elem, w){
                elem.outerHTML = template.make("weekHeader", {
                    weekNo: w + 1
                });
            });
        } else if (input.classList.contains("editor_day_name")) {
            parent.classList.toggle("disabled");
        }
    });

    editor.container.addEventListener("submit", function(e){
        e.preventDefault();

        if (editor.container.checkValidity()) {
            console.log("table valid, saving");

            (function(){
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
                        day.disabled = row.classList.contains("disabled");

                        var tds = row.querySelectorAll(".editor_period");
                        tds.each(function(elem){
                            var nameInput = elem.querySelector(".editor_period_name");
                            var timeInput = document.querySelectorAll(".editor_time")[i];

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
            })();

            zeit.lastSave = {
                time: new Date(),
                week: Number(editor.weekInput.value) - 1 || 0
            };
            localStorage.setItem("zeitgeist_last_save", JSON.stringify(zeit.lastSave));

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
        cloned.querySelector(".editor_week_header").outerHTML = template.make("weekHeader", {
            weekNo: editor.tables.children.length
        });
    });

    try {
        editor.weekInput.value = zeit.getWeek() + 1;
    } catch (e) {
        editor.weekInput.value = 1;
    }

    display.configBtn.addEventListener("click", function(){
        editor.container.show();
    });
})();
