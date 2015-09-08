
var Amdahl = (function($) { 

    var maxSteps = 15;              // max steps in a business process
    var defaultStepTime = 5;        // default elapsed time for a process step
    var defaultFactor = 1;          // default speed-up factor for a step

    var businessProcessDescriptionSelector = "#business-process-description";
    var instructionsContainer = "#instructions-container";
    var businessProcessStepsContainer = "#business-process-steps-container";
    var businessProcessStepsBody = "#business-process-steps";
    var businessProcessReportContainer = "#business-process-report-container";
    var businessProcessReportBody = "#business-process-report";

    var instructions = "For each step in the process (Step A, Step B, ..) \
        update the length of time each step takes (Step Time)             \
        to run now and set the factor of improvement (Speed-up Factor)    \
        you expect for each step after a redesign (where a factor of 1.0  \
        means the process stays the same, 1.5 indicates the process runs  \
        50% quicker, and 0.4 indicates the process degrades by 60% etc.";

    function clearResults() { 
        $(instructionsContainer).empty();
        $(businessProcessStepsBody).empty();
        $(businessProcessStepsContainer).hide()
        $(businessProcessReportBody).empty()
        $(businessProcessReportContainer).hide();
    }

    function buildProcessStepsTable() { 

        var stepsInput = $("#steps-in-process")
        var numberOfSteps = stepsInput.val();

        if(numberOfSteps === "") { return; }
        if(isNaN(numberOfSteps)) { return; }

        if(numberOfSteps > maxSteps) { 
            numberOfSteps = maxSteps;
            stepsInput.val(numberOfSteps);
        };

        clearResults();

        $(businessProcessStepsContainer).show();
        $(instructionsContainer).append(html.para(instructions));

        var target = $(businessProcessStepsBody);

        var table = html.table("process-data");

        target.append(table);

        var tableHeaderRow = html.tr();
        tableHeaderRow.append(html.th("ID"));
        tableHeaderRow.append(html.th("Step Name"));
        tableHeaderRow.append(html.th("Step Time (mins)"));
        tableHeaderRow.append(html.th("% of Process Time"));
        tableHeaderRow.append(html.th("Speed-Up Factor"));

        table.append(tableHeaderRow);

        var defaultPerc = ((defaultStepTime / (defaultStepTime * numberOfSteps)) * 100).toFixed(2);

        for(var i=0; i < numberOfSteps; i++) { 
            var tableDataRow = html.tr();
            tableDataRow.append(html.td(i+1));
            tableDataRow.append(html.td(html.textInput("step_name[]","Step " + unescape('%' + (i+65).toString(16)))));
            tableDataRow.append(html.td(html.textInput("step_time[]", defaultStepTime, false, updateTotal)));
            tableDataRow.append(html.td(html.textInput("step_perc[]", defaultPerc, true)));
            tableDataRow.append(html.td(html.textInput("step_fact[]", defaultFactor)));
            table.append(tableDataRow);
        }

        var tableSummaryRow = html.tr();
        tableSummaryRow.append(html.td("&nbsp;"));
        tableSummaryRow.append(html.td("Totals (Now)"));
        tableSummaryRow.append(html.td(html.textInput("total_time", (numberOfSteps * defaultStepTime), true)));
        tableSummaryRow.append(html.td(html.textInput("total_total", "100%", true)));

        var reportButton = $("<button>")
            .html("report")
            .addClass("btn")
            .addClass("btn-primary")
            .on("click", buildReport);

        tableSummaryRow.append(html.td(reportButton));
        table.append(tableSummaryRow);

    }

    function buildReport() { 

        var speedups = document.getElementsByName("step_fact[]");
        var changes = false;

        $(businessProcessReportContainer).show();
        $(businessProcessReportBody).empty();

        for(i=0; i < speedups.length; i++) { 
            if(speedups[i].value != "1") { 
                changes = true;
                break;
            }
        }

        if(!changes) { 
            $(businessProcessReportBody).append( 
                  html.para("All your speedup factors are set to 1")
                + html.para("Your new elapsed process time will be the same")
                + html.para("Try changing some of the factors in the table to values other than 1")
            );
            return false;
        }

        var stepNames = document.getElementsByName("step_name[]");
        var stepTimes = document.getElementsByName("step_time[]");
        var stepFacts = document.getElementsByName("step_fact[]");
        var stepPercs = document.getElementsByName("step_perc[]");

        // pre-calculate some totals

        var totalFactor = 0;
        var contributions = [];
        var stepPercentages = [];
        var stepFactors = [];
        var oldElapsed = parseInt($("input:text[name=total_time]").val()).toFixed(3);
        for(var i=0; i < stepTimes.length; i++) { 
            stepPercentages[i] = (parseFloat(stepPercs[i].value) / 100).toFixed(3);
            stepFactors[i]     = (parseFloat(stepFacts[i].value)).toFixed(3);
            contributions[i] = (stepPercentages[i] / stepFactors[i]).toFixed(3);
            totalFactor += parseFloat(contributions[i]);
        }
        var newElapsed = (totalFactor * oldElapsed).toFixed(3)

        $(businessProcessReportBody).append(html.table("report-data"));

        var reportHeaderRow = html.tr();
        reportHeaderRow.append(html.th("ID"));
        reportHeaderRow.append(html.th("Step Name"));
        reportHeaderRow.append(html.th("Original Time<br/>[T<sub>1</sub>]"));
        reportHeaderRow.append(html.th("Original % of<br/> Process Time[P<sub>1</sub>]</th>"));
        reportHeaderRow.append(html.th("Speed-Up Factor<br/>[F]"));
        reportHeaderRow.append(html.th("Contribution<br/>[P<sub>1</sub>/F]"));
        reportHeaderRow.append(html.th("New Time<br/>[T<sub>2</sub>]"));
        reportHeaderRow.append(html.th("New % of Process Time<br/>[P<sub>2</sub>]"));

        $("#report-data").append(reportHeaderRow);

        for(var i=0; i < stepTimes.length; i++) { 

            var stepElapsed = (parseFloat(stepTimes[i].value)).toFixed(3);
            var newTime = (stepElapsed * (1/stepFactors[i]) ).toFixed(3);
            var newPerc = (newTime / newElapsed).toFixed(3);

            var reportDataRow = html.tr();
            reportDataRow.append(html.td(i+1));
            reportDataRow.append(html.td(stepNames[i].value));
            reportDataRow.append(html.td(stepElapsed));
            reportDataRow.append(html.td(stepPercentages[i]));
            reportDataRow.append(html.td(stepFactors[i]));
            reportDataRow.append(html.td(contributions[i]));
            reportDataRow.append(html.td(newTime));
            reportDataRow.append(html.td(newPerc));

            $("#report-data").append(reportDataRow);
        }

        var reportSummaryRow = html.tr();
        reportSummaryRow.append(html.td("&nbsp;"));
        reportSummaryRow.append(html.td("&nbsp;"));
        reportSummaryRow.append(html.td(oldElapsed));
        reportSummaryRow.append(html.td("&nbsp;"));
        reportSummaryRow.append(html.td("&nbsp;"));
        reportSummaryRow.append(html.td(totalFactor.toFixed(3)));
        reportSummaryRow.append(html.td(newElapsed));
        reportSummaryRow.append(html.td("&nbsp;"));

        $("#report-data").append(reportSummaryRow);

        $(businessProcessReportBody).append( 
            html.para("Before the changes the process completed in " + oldElapsed + " minutes")
        );

        $(businessProcessReportBody).append( 
            html.para("The process will now complete in " + newElapsed + " minutes (total new factor * old elapsed time)")
        );
    }

    function updateTotal() { 

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

    }

    var html = { 

        para: function(text) { 
            var p = $("<p>");
            if(text!==undefined) { p.html(text); }
            return p;
        },

        table: function(id) { 
            var t = $("<table>").addClass("table");
            if(id!==undefined) { t.attr("id", id); }
            return t;
        },

        tr: function() { 
            return $("<tr>");
        },

        th: function(text) { 
            var th = $("<th>");
            if(text!==undefined) { th.html(text); }
            return th;
        },

        td: function(text) { 
            var td = $("<td>");
            if(text!==undefined) { td.html(text); }
            return td;
        },

        textInput: function (name, value, disabled, onchange) { 
            var inp = $("<input>")
                .attr("type", "text")
                .attr("value", value)
                .attr("name", name);

            if(disabled!==undefined && disabled!==false) { 
                inp.prop("readonly", true);
            }

            if(onchange!== undefined) { 
                inp.on("change", function(e) { onchange(); });
            }

            return inp;
        }

    }

    return { 

        init: function() { 
            $(businessProcessStepsContainer).hide();
            $(businessProcessReportContainer).hide();
            $("#buildTable").on("click", function(e) { 
                e.preventDefault(); 
                buildProcessStepsTable();
            });
            $("#clear").on("click", function(e) { 
                e.preventDefault(); 
                clearResults();
            });
        }

    }

}(jQuery));
