function make_nextnum(str)
{
    return function()
    {
        while (str.length > 0) {
            var ch = str.charAt(0);
            str = str.slice(1);
            if ("0123456789".indexOf(ch) >= 0) {
                return parseInt(ch);
            }
        }
        return 0;
    };
}
function rule_translate(r)
{
    r = r.replace(/\n/g, " ");
    r = "rulevar={};" + r;
    r = r.replace(/IF(.*)THEN(.*)/g, "{clearbuffer(); export_flag2 = false; if($1){$2} if(export_flag2)rule_fire++;}");
    //console.log(r);
    r = r.replace(/ADVANCED(.*)/g, "if(!use_advanced)return false;{$1}");
    //console.log(r);
    r = r.replace(/EXISTS{([^:}]*):([^:}]*):([^:}]*)}/g, "(function(){FOR{$1:$2}if($3)return true;return false;})()");
    //console.log(r);
    r = r.replace(/ANY{([^:}]*):([^:}]*):([^:}]*)}/g, "(function(){FOR{$1:$2}if(!($3))return false;return true;})()");
    //console.log(r);
    r = r.replace(/ALL{([^:}]*):([^:}]*):([^:}]*)}/g, "do{FOR{$1:$2}{$3}}while(0)");
    //console.log(r);
    for (i = 1; i <= 100; i++) r = r.replace(/FORALL{([^,}]*),([^}]*)}/g, "for(var $1=1;rulevar.$1=$1,$1<=9;$1++)FORALL{$2}");
    r = r.replace(/FORALL{([^,}]*)}/g, "for(var $1=1;rulevar.$1=$1,$1<=9;$1++)");
    for (i = 1; i <= 100; i++) r = r.replace(/FOR{([^,}:]*),([^}:]*):([^}:]*)}/g, "for(var $1=1;rulevar.$1=$1,$1<=9;$1++)FOR{$2:$3}");
    r = r.replace(/FOR{([^,:}]*):([^}]*)}/g, "for(var $1=1;rulevar.$1=$1,$1<=9;$1++)if($2)");
    return "(function(){{" + r + "}return true;})()";
}
function splitrules(ruletext)
{
    var ret = ruletext.split("RULE");
    return ret;
}

function convert()
{
    var str = $("#puzzle").val();
    var nextnum = make_nextnum(str);
    var ans = new Array(), mask = new Array();
    for (var i = 0; i < 81; i++) ans[i] = nextnum();
    for (var i = 0; i < 81; i++) mask[i] = nextnum();
    var out = "";
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            if (mask[i * 9 + j] == 0) {
                out += ans[i * 9 + j].toString() + " ";
            } else {
                out += "0 ";
            }
        }
        out += "\n";
    }
    $("#puzzle").val(out);
}



var puz, puz_not;
var puz_from, puz_not_from;
var export_cnt;
var cur_rule;
var cur_iter;
var rule_fire;
var export_flag;
var export_flag2;
var total_fires;
var factlist;
var rulelist;
var rulevar;
var use_advanced;

function compile()
{
    var ruletext = $("#rules").val();
    rulelist = splitrules(ruletext);
    return rulelist.map(r => rule_translate(r));
}

function check()
{
    /*var cheat = "942718653378645219165239874526981347417523968839467125254396781683174592791852436";
    var nextnum = make_nextnum(cheat);
    for (i = 1; i <= 9; i++)
        for (j = 1; j <= 9; j++) {
            var n = nextnum();
            if (puz[i][j] != 0) {
                if (puz[i][j] != n) throw "error";
            }
            if (puz_not[i][j][n] === true) {
                throw "error";
            }
        }*/
}

var loglist;
function clear_log()
{
    loglist = new Array();
}
function append_log(logstr)
{
    loglist.push(logstr);
}

function write_log(logstr)
{
    console.log(logstr);
    append_log("INFO: " + logstr);
}
function write_log_with_rule(factid, usedfacts, logstr)
{
    var puzstr = "";
    for (var i = 1; i <= 9; i++)
        for (var j = 1; j <= 9; j++)
            puzstr += puz[i][j];
    var puznotstr = "";
    for (var i = 1; i <= 9; i++)
        for (var j = 1; j <= 9; j++)
            for (var k = 1; k <= 9; k++)
                puznotstr += puz_not[i][j][k] === true ? "1" : "0";
    factlist[factid] = { iter: cur_iter, rule: cur_rule, usedfacts: usedfacts, logstr: logstr, puzstr: puzstr, puznotstr: puznotstr, rulevar: JSON.parse(JSON.stringify(rulevar))};
    append_log("ITER " + cur_iter + " FACT " + factid + ": RULE " + cur_rule + " WITH " + usedfacts.join(" ") + " => " + logstr);
}
function generror(errstr)
{
    throw "RULE " + cur_rule + ": " + errstr;
}


var used_rules;
function clearbuffer() { used_rules = new Array(); }
function pushbuffer(x)
{
    if (x === undefined) x = -1;
    used_rules.push(x);
}
function getused()
{
    return used_rules.sort((a,b)=>a-b).filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
    });
}



function gong(x, y) { return Math.floor((x - 1) / 3) * 3 + Math.floor((y - 1) / 3) + 1; }
function cantbe(x, y, n) { pushbuffer(puz_not_from[x][y][n]); return puz_not[x][y][n] === true; }
function mustbe(x, y, n) { pushbuffer(puz_from[x][y]); return puz[x][y] === n; }
function a(x, y) { pushbuffer(puz_from[x][y]); return puz[x][y]; }
function sure(x, y) { pushbuffer(puz_from[x][y]); return puz[x][y] !== 0; }

function export_mustbe(x, y, num)
{
    if (a(x, y) != 0) {
        if (a(x, y) != num || cantbe(x, y, num)) generror("mustbe: (" + x + ", " + y + ")=" + puz[x][y] + " num=" + num);
        return;
    }
    puz_from[x][y] = ++export_cnt;
    write_log_with_rule(export_cnt, getused(), " (" + x + ", " + y + ") must be " + num);
    puz[x][y] = num;
    export_flag2 = export_flag = true;
    check();
}
function export_cantbe(x, y, num)
{
    if (puz_not[x][y][num] == true) return;
    if (a(x, y) == num) generror("cantbe: (" + x + ", " + y + ")=" + puz[x][y] + " num=" + num);
    puz_not_from[x][y][num] = ++export_cnt;
    write_log_with_rule(export_cnt, getused(), " (" + x + ", " + y + ") cant be " + num);
    puz_not[x][y][num] = true;
    export_flag2 = export_flag = true;
    check();
}

function evalrules(rules)
{
    export_flag = false;
    use_advanced = false;
    while (1) {
        for (var rid = 1; rid < rules.length; rid++) {
            var x = rules[rid];
            var st = performance.now();
            cur_rule = rid;
            rule_fire = 0;
            if (eval(x) === false) continue;
            var ed = performance.now();
            total_fires[rid] += rule_fire;
            total_cputime[rid] += (ed - st);
            write_log("RULE " + rid + ", fires " + rule_fire + " times, finished in " + ((ed - st) / 1000) + "s");
        }
        if (export_flag || use_advanced) break;
        use_advanced = true;
        write_log("SIMPLE RULES EXHAUSTED, USING ADVANCED RULES");
    }
    return export_flag;
}
function new_vector(fn, count)
{
    var ret = new Array();
    for (var i = 0; i <= (count !== undefined ? count : 9); i++)
        ret[i] = fn();
    return ret;
}
function queryfact()
{
    var q = parseInt($("#queryinput").val());
    var result = "";
    if (factlist !== undefined) {
        var qf = factlist[q];
        console.log(qf);
        result += "======== RULE       =========\nRULE" + rulelist[qf.rule];
        result += "======== RESULT     ========\n" + qf.logstr + "\n\n";
        result += "======== RULE VARS  ========\n" + JSON.stringify(qf.rulevar, null, 2).replace(/["{}\n]/g, "") + "\n\n";
        result += "======== STATUS     ========\n";
        var statstr = "";
        for (i = 0; i < 9; i++) {
            for (j = 0; j < 9; j++) {
                var ch = qf.puzstr.charAt(i * 9 + j);
                if (ch == "0") ch = ".";
                statstr += ch;
                statstr += "["
                for (k = 0; k < 9; k++) {
                    var f = qf.puznotstr.charAt(i * 81 + j * 9 + k);
                    if (f == "1") {
                        statstr += ".";
                    } else {
                        statstr += (k + 1).toString();
                    }
                }
                statstr += "] ";
                if (j == 2 || j == 5) statstr += "## ";
            }
            statstr += "\n";
            if (i == 2 || i == 5) {
                for (var t = 1; t <= 13*9+5; t++) statstr += "#";
                statstr += "\n";
            }
        }
        result += statstr + "\n";
        
        result += "======== USED FACTS ========\n";
        qf.usedfacts.forEach(x => {
            if (x >= 0 && factlist[x] !== undefined) { 
                result += "  FACT " + x + ": " + factlist[x].logstr + "\n";
            } else if (x < 0) {
                x = -x - 1;
                var s = Math.floor(x / 9) + 1;
                var t = (x % 9 + 1);
                var ch = qf.puzstr.charAt(x);
                if (ch == "0") ch = "unknown";
                result += "  INPUT (" + s + ", " + t + ") = " + ch + "\n";
            }
        });   
    } else {
        result = "no info";
    }
    $("#queryresult").val(result).scrollTop(0);
}
function solve()
{
    clear_log();
    export_cnt = 0;
    cur_rule = -1;
    var puzzletext = $("#puzzle").val();
    var nextnum = make_nextnum(puzzletext);
    factlist = new Array();
    puz = new_vector(() => new Array());
    puz_not = new_vector(() => new_vector(() => new Array()));
    puz_from = new_vector(() => new Array());
    puz_not_from = new_vector(() => new_vector(() => new Array()));
    for (i = 1; i <= 9; i++) {
        for (j = 1; j <= 9; j++) {
            puz[i][j] = nextnum();
            puz_from[i][j] = -((i - 1) * 9 + (j - 1) + 1);
        }
    }
    
    var rules = compile();
    total_fires = new_vector(() => 0, rules.length);
    total_cputime = new_vector(() => 0, rules.length);
    $("#compiled_rules").val(rules.join("\n\n\n"));
    cur_iter = 1;
    var st = performance.now();
    while (1) {
        cur_iter++;
        var iter_st = performance.now();
        var flag = evalrules(rules);
        var iter_ed = performance.now();
        write_log("ITERATION " + cur_iter + " takes " + ((iter_ed - iter_st) / 1000) + "s");
        if (!flag) break;
    }
    var ed = performance.now();
    
    var ans = "";
    var unresolved = 0;
    for (i = 1; i <= 9; i++) {
        for (j = 1; j <= 9; j++) {
            if (puz[i][j] != 0)
                ans += puz[i][j] + " ";
            else
                ans += ". ";
            if (puz[i][j] == 0) unresolved++;
        }
        ans += "\n";
    }
    $("#answer").val(ans);
    
    write_log("================ SUMMARY ================");
    write_log("FINISHED in " + ((ed - st) / 1000) + "s");
    write_log(unresolved + " UNRESOLVED");
    write_log("TOTAL " + cur_iter + " ITERATIONS");
    write_log("RULE SUMMARY:");
    for (i = 1; i < rules.length; i++) {
        write_log("  RULE " + i + " fires " + total_fires[i] + " times, cputime " + total_cputime[i] / 1000 + "s");
    }
    $("#log").val(loglist.join("\n"));
    var psconsole = $('#log');
    if(psconsole.length)
        psconsole.scrollTop(psconsole[0].scrollHeight - psconsole.height());
}

$(document).ready( function () {
    $("#sudokufrm")[0].reset();
});
