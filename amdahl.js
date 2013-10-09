

if (typeof jQuery == 'undefined') {  
    alert("JQuery not present");
}
else {
    $(function() { 

        if( $("#amdahl").length === 0 )
            $("body").append('<div id="amdahl"></div>');

        $("#amdahl").append(' \
            <style> \
                label { \
                    display: inline-block; \
                    width: 150px; \
                } \
                input:disabled { \
                    background: #EEEEEE; \
                } \
                .center { \
                    text-align: center; \
                } \
                td { \
                    text-align: center; \
                } \
            </style> \
            <div id="process"> \
                <b>Business Process</b><br/> \
                <label for="steps">Steps in Process</label> \
                <input type="text" name="steps" placeholder="steps" size="3" /> \
                <input type="button" value=" -build- " onclick="Amdahl.stepsTable()" />  \
                <input type="button" value=" -clear- " onclick="Amdahl.clearAll()" /><br/> \
            </div> \
        ');
    });
}

Amdahl = {};

Amdahl.stepsTable = function() {

    var inputSteps = $("input:text[name=steps]")
    var steps = inputSteps.val();

    if( steps === "" ) return;
    if( $("#steps").length > 0 ) return;

    if( isNaN(steps) ) { 
        alert("steps must be a number");
        return;
    }

    if( steps > 10 ) {
        steps = 10;
        inputSteps.val(10)
    };

    $("#amdahl").append(' \
        <div id="steps"> \
        </div> \
    ');

    $("#steps").append(" \
        <p>Now, for each step in the process (A, B, C..) \
        update the length of time each step takes \
        to run now and set the factor of improvement you \
        expect for each step after a redesign - where 1.0 \
        means the process stays the same, 1.5 indicates the \
        process runs 50% quicker and 0.4 indicates that the \
        process degrades by 60% etc.</p>\
    ");

    Amdahl.processTable( $("#steps"), steps );

};

Amdahl.clearAll = function() {
    $("#steps").remove();
    $("#report").remove();
};

Amdahl.processTable = function(div, rows) { 

    if(rows === undefined) return;

    div.append('<table id="process-data">');

    $("#process-data").append(
        "<tr> \
            <th>ID</th> \
            <th>Step Name</th> \
            <th>Step Time</th> \
            <th>% of Process Time</th> \
            <th>Speed-Up Factor</th> \
        </tr>"
    );

    var defaultTime = 5;
    var defaultPerc = ((defaultTime / (defaultTime * rows)) * 100).toFixed(2);
    var defaultFact = 1;

    for(var i=0; i < rows; i++) { 
        $("#process-data").append(
              '<tr>'
                + '<td>'
                    + (i+1) + '</td>'
                + '<td>'
                    + '<input class="center" type="text" size="30" name="step_name[]" value="Step ' + unescape('%' + (i+65).toString(16)) + '" disabled>'
                + '</td>'
                + '<td>'
                    + '<input class="center" type="text" size="5" name="step_time[]" value="' + defaultTime + '" onchange="Amdahl.updateTotal()">'
                + '</td>'
                + '<td>'
                    + '<input class="center" type="text" size="5" name="step_perc[]" value="' + defaultPerc + '" disabled>'
                + '</td>'
                + '<td>'
                    + '<input class="center" type="text" size="5" name="step_fact[]" value="' + defaultFact + '">'
                + '</td>'
            + '</tr>'
        );
    }

    $("#process-data").append(
        '<tr>'
            + '<td>&nbsp;</td>'
            + '<td>Totals (Now)</td>'
            + '<td>'
                + '<input class="center" type="text" name="total_time" value="' + (rows * defaultTime) + '" disabled>'
            + '</td>'
            + '<td>'
                + '<input class="center" type="text" value="100%" disabled>'
            + '</td>'
            + '<td>&nbsp;</td>'
        + '</tr>'
    );

    $("#process-data").append(
        '<tr>'
            + '<td>&nbsp;</td>'
            + '<td>&nbsp;</td>'
            + '<td>&nbsp;</td>'
            + '<td>&nbsp;</td>'
            + '<td><input type="submit" value=" -report- " onclick="Amdahl.buildReport()"></td>'
        + '</tr>'
    );
};

Amdahl.buildReport = function() { 

    var speedups = document.getElementsByName("step_fact[]");
    var changes = false;

    for(i=0; i < speedups.length; i++) { 
        if(speedups[i].value != "1") { 
            changes = true;
            break;
        }
    }

    if(!changes) { 
        alert("All your speedup factors are set to 1.\n\nYour new elapsed process time will be the same!")
        return false;
    }

    if( $("#report").length > 0 )
        $("#report").remove();

    $("#amdahl").append(' \
        <div id="report"> \
            <b>Report</b><br/> \
        </div> \
    ');

    var oldProcTime = parseInt($("input:text[name=total_time]").val());

    var stepNames = document.getElementsByName("step_name[]");
    var stepTimes = document.getElementsByName("step_time[]");
    var stepFacts = document.getElementsByName("step_fact[]");
    var stepPercs = document.getElementsByName("step_perc[]");

    $("#report").append('<table id="report-data">');

    $("#report-data").append(
        "<tr> \
            <th>ID</th> \
            <th>Step Name</th> \
            <th>Orig. Time (To)</th> \
            <th>Orig % of Process Time (Po)</th> \
            <th>Speed-Up Factor (F)</th> \
            <th>Contribution (Po/F)</th> \
            <th>New Time</th> \
        </tr>"
    );

    var totalFactor = 0;

    for(var i=0; i < stepTimes.length; i++) { 
        var stepPercentage = (parseFloat(stepPercs[i].value) / 100).toFixed(3);
        var stepFactor     = (parseFloat(stepFacts[i].value)).toFixed(3);
        var stepElapsed    = (parseFloat(stepTimes[i].value)).toFixed(3);

        var contribution = (stepPercentage / stepFactor).toFixed(3);
        var newtime = (stepElapsed * (1/stepFactor) ).toFixed(3);
        totalFactor += parseFloat(contribution);

        $("#report-data").append( 
            '<tr>'
                + '<td>' + (i+1) + '</td>'
                + '<td>' + stepNames[i].value + '</td>'
                + '<td>' + stepElapsed + '</td>'
                + '<td>' + stepPercentage + '</td>'
                + '<td>' + stepFactor + '</td>'
                + '<td>' + contribution + '</td>'
                + '<td>' + newtime + '</td>'
            + '</tr>'
        );
    }

    $("#report-data").append( 
        '<tr>'
            + '<td>&nbsp;</td>'
            + '<td>&nbsp;</td>'
            + '<td>&nbsp;</td>'
            + '<td>&nbsp;</td>'
            + '<td>&nbsp;</td>'
            + '<td>' + totalFactor.toFixed(3) + '</td>'
            + '<td>&nbsp;</td>'
        + '</tr>'
    );

    $("#report").append(
          "<p>Before the changes the process completed in "
        + oldProcTime.toFixed(3)
        + " minutes. </p>"
    );

    $("#report").append(
          "<p>The process will now complete in " 
        + (totalFactor * oldProcTime).toFixed(3)
        + " minutes (total new factor * old elapsed time). "
    );
};

Amdahl.updateTotal = function() {

    var stepTimes = document.getElementsByName("step_time[]");
    var stepTimesTotal = 0;
    for(var i=0; i < stepTimes.length; i++) { 
        if(!isNaN(stepTimes[i].value))
            stepTimesTotal += parseInt(stepTimes[i].value);
        else
            stepTimes[i].value = "5";
    }
    $("input:text[name=total_time]").val(stepTimesTotal);

    var stepPerc = document.getElementsByName("step_perc[]");
    for(var i=0; i < stepPerc.length; i++) { 
        var percVal = parseInt(stepTimes[i].value);
        var percNew = parseFloat(100 * (percVal/stepTimesTotal));
        stepPerc[i].value = percNew.toFixed(2);
    }

};