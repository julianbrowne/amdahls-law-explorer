
import {config} from "./config";
import {selectors} from "./selectors";

function DomTools(parentElementSelector) { 

	this.parentElementSelector = (typeof parentElementSelector === 'undefined') ? selectors.defaultContainer : parentElementSelector;
	this.elementTarget = $(this.parentElementSelector);
	const domTools = this;

	function clearResults() { 
	    $("#"+selectors.instructionsContainerId).remove();
	    $("#"+selectors.processTableId).remove();
	    $("#"+selectors.processReportPanelId).remove();
	    $("#"+selectors.reportTableContainerId).remove();
	};

	function clearPerformanceReport() { 
	    $("#"+selectors.reportTableContainerId).remove();
	};

	function tidyNumber(n) { 
		return Number(n.toFixed(2));
	};

	this.performanceReport = function(data) { 

		clearPerformanceReport();

		/**
		 * Calculate old process total time by summing step times
		**/

		let oldProcessTime = 0;
		for(let i=0; i<data.length; i++) { 
			oldProcessTime += data[i].time;
		}

		/**
		 * Calculate new times
		**/

	    let totalFactor = 0;
	    let newProcessTime = 0;
	    const contributions = [];

	    for(let i=0; i<data.length; i++) { 
	    	data[i].newTime = data[i].time * (1 / data[i].factor);
	    	newProcessTime += data[i].newTime;
	        contributions[i] = (data[i].percentage / data[i].factor).toFixed(2);
            totalFactor += parseFloat(contributions[i]);
	    };

		const card = $("<div>")
			.attr("id", selectors.reportTableContainerId)
			.addClass("card");

		const feature = $("<div>")
			.addClass("card-header")
			.html("Process Report");

		const body = $("<div>")
			.addClass("card-body");

	    const table = $("<table>")
	    	.attr("id", selectors.reportTableId)
	    	.addClass("table")
	    	.addClass("table-striped");

	    const thead = $("<thead>");
	    const header = $("<tr>");
	    header.append($("<th>").html("ID"));
	    header.append($("<th>").html("Step Name"));
	    header.append($("<th>").html("Original Time<br/>[T<sub>1</sub>]"));
	    header.append($("<th>").html("Original % of<br/> Process Time[P<sub>1</sub>]</th>"));
	    header.append($("<th>").html("Speed-Up Factor<br/>[F]"));
	    header.append($("<th>").html("Contribution<br/>[P<sub>1</sub>/F]"));
	    header.append($("<th>").html("New Time<br/>[T<sub>2</sub>]"));
	    header.append($("<th>").html("New % of Process Time<br/>[P<sub>2</sub>]"));
	    thead.append(header);
	    table.append(thead);

	    const tbody = $("<tbody>");

	    for(let i=0; i<data.length; i++) { 

	        const newStepPercentage = (data[i].newTime / newProcessTime) * 100;

	        const row = $("<tr>");
	        row.append($("<td>").html(i+1));
	        row.append($("<td>").html(data[i].name));
	        row.append($("<td>").html(data[i].time));
	        row.append($("<td>").html(data[i].percentage));
	        row.append($("<td>").html(data[i].factor));
	        row.append($("<td>").html(contributions[i]));
	        row.append($("<td>").html(tidyNumber(data[i].newTime)));
	        row.append($("<td>").html(tidyNumber(newStepPercentage)));
	        tbody.append(row);

	    }

	    const summary = $("<tr>");
	    summary.append($("<td>").html("&nbsp;"));
	    summary.append($("<td>").html("Totals (After)"));
	    summary.append($("<td>").html(oldProcessTime));
	    summary.append($("<td>").html("100%"));
	    summary.append($("<td>").html("&nbsp;"));
	    summary.append($("<td>").html(tidyNumber(totalFactor)));
	    summary.append($("<td>").html(tidyNumber(newProcessTime)));
	    summary.append($("<td>").html("100%"));

	    tbody.append(summary);
	    table.append(tbody);

	    card.append(feature);
	    body.append(table);
	    card.append(body);
	    this.elementTarget.append(card);
	};

	this.updateProcessTable = function(amdahlData) { 

		if(("#"+selectors.processTableId).length === 0) return;

		// update names
		// <input class="form-control" type="text" value="Step B" name="step-name-2">

		for(let i=0; i<amdahlData.length; i++) { 
			$("input[name='step-name-" + parseInt(i+1) + "']").val(amdahlData[i].name);
		};

		// update times & total
		// <input class="form-control" type="text" value="5" name="step-time-1">

		let totalTime = 0;
		for(let i=0; i<amdahlData.length; i++) { 
			$("input[name='step-time-" + parseInt(i+1) + "']").val(amdahlData[i].time);
			totalTime += amdahlData[i].time;
		};

		$("input[name='" + selectors.totalProcessTimeTdName + "']").val(totalTime);

		// update percentages
		// <input class="form-control" type="text" value="16.67" name="step-percentage-4" readonly="" disabled="">

		for(let i=0; i<amdahlData.length; i++) { 
			$("input[name='step-percentage-" + parseInt(i+1) + "']").val(amdahlData[i].percentage);
		};

		// factors
		// <input class="form-control" type="text" value="1" name="step-factor-6">

		for(let i=0; i<amdahlData.length; i++) { 
			$("input[name='step-factor-" + parseInt(i+1) + "']").val(amdahlData[i].factor);
		};

		setReportButtonData(
			$("#"+selectors.buildProcessChangeReportButtonId), 
			amdahlData
		);

	};

	function setReportButtonData(button, data) { 
		button.off("click");
		button.on("click", function(e) { 
	        e.preventDefault();
	    	domTools.performanceReport(data);
        });
	};

    this.buildProcessStepsTable = function(amdahlData, updateCallback) { 

        clearResults();
		this.addInstructions();

       /**
        * Build the main Process Table
       **/

		const card = $("<div>")
        	.attr("id", selectors.processTableId)
			.addClass("card");

		const feature = $("<div>")
			.addClass("card-header")
			.html("Process Step Definitions");

		const body = $("<div>")
			.addClass("card-body");

        const table = $("<table>")        	.addClass("table")
        	.addClass("table-striped");

        this.elementTarget.append(table);

        const thead = $("<thead>");
        const tableHeaderRow = $("<tr>");
        tableHeaderRow.append($("<th>").html("ID"));
        tableHeaderRow.append($("<th>").html("Step Name"));
        tableHeaderRow.append($("<th>").html("Step Time"));
        tableHeaderRow.append($("<th>").html("% of Process Time"));
        tableHeaderRow.append($("<th>").html("Speed-Up Factor"));
        thead.append(tableHeaderRow);
        table.append(thead);

        const tbody = $("<tbody>");

        for(let i=0; i < amdahlData.length; i++) { 

            const row = $("<tr>");

            row.append($("<th>")
            	.addClass("text-center")
            	.html(amdahlData[i].id+1));

            row.append($("<td>")
            	.html($("<input>")
            	.addClass("form-control")
            	.attr("type", "text")
            	.attr("value", amdahlData[i].name)
            	.data("step", i)
            	.attr("name", "step-name-"+parseInt(i+1))
            	.prop("readonly", false)
            	.prop("disabled", false)
            	.change({type: "name"}, updateCallback)));

            row.append($("<td>")
            	.html($("<input>")
            	.addClass("form-control")
            	.attr("type", "text")
            	.attr("value", amdahlData[i].time)
            	.data("step", i)
            	.attr("name", "step-time-"+parseInt(i+1))
            	.prop("readonly", false)
            	.prop("disabled", false)
            	.change({type: "time"}, updateCallback)));

            row.append($("<td>")
            	.html($("<input>")
            	.addClass("form-control")
            	.attr("type", "text")
            	.attr("value", amdahlData[i].percentage)
            	.data("step", i)
            	.attr("name", "step-percentage-"+parseInt(i+1))
            	.prop("readonly", true)
            	.prop("disabled", true)));

            row.append($("<td>")
            	.html($("<input>")
            	.addClass("form-control")
            	.attr("type", "text")
            	.attr("value", amdahlData[i].factor)
            	.data("step", i)
            	.attr("name", "step-factor-"+parseInt(i+1))
            	.prop("readonly", false)
            	.prop("disabled", false)
            	.change({type: "factor"}, updateCallback)));

            tbody.append(row);
        };

		const processTotalTime = amdahlData
			.map(function(stepData) { 
				return stepData.time;
			})
			.reduce(function(previous, next) { 
				return previous + next;
			});

        const tableSummaryRow = $("<tr>");
        tableSummaryRow.append($("<td>").html("&nbsp;"));
        tableSummaryRow.append($("<td>").html("Totals (Now)"));
        tableSummaryRow.append($("<td>").html($("<input>")
        	.addClass("form-control")
        	.attr("type", "text")
        	.attr("value", processTotalTime)
        	.attr("name", selectors.totalProcessTimeTdName)
        	.prop("readonly", true)
        	.prop("disabled", true)));

        tableSummaryRow.append($("<td>").html($("<input>")
        	.addClass("form-control")
        	.attr("type", "text")
        	.attr("value", "100%")
        	.attr("name", "total-percentage")
        	.prop("readonly", true)
        	.prop("disabled", true)));

        tableSummaryRow.append($("<td>"));

        tbody.append(tableSummaryRow);
        table.append(tbody);

        card.append(feature);
        body.append(table);
        card.append(body);

        this.elementTarget.append(card);

        /**
         * 
        **/

		const container = $("<div>")
			.attr("id", selectors.processReportPanelId)
			.addClass("panel-body");

		const formGroup = $("<div>")
			.addClass("text-end")
			.addClass("form-group");

		const inputGroup = $("<div>")
			.addClass("btn-group")
			.attr("role", "group");

		const label = $("<span>")
			.addClass("input-group-text")
			.html("Process Report");

        const clearButton = $("<button>")
            .html("clear")
            .addClass("btn")
			.addClass("btn-warning")
            .on("click", function(e) { 
		        e.preventDefault();
		        clearPerformanceReport();
            });

        const reportButton = $("<button>")
        	.attr("id", selectors.buildProcessChangeReportButtonId)
            .html(config.buildReportButtonText)
            .addClass("btn")
            .addClass("btn-primary");

        setReportButtonData(reportButton, amdahlData);

        inputGroup
        	.append(label)
        	.append(clearButton)
        	.append(reportButton);

        container.append(formGroup.append(inputGroup));
        this.elementTarget.append(container);

    };

  	this.addDataInputs = function(callback) { 

		const container = $("<div>")
			.attr("id", "business-process-description")
			.addClass("card");

		const feature = $("<div>")
			.addClass("card-header")
			.html("Business Process");

		const body = $("<div>")
			.addClass("card-body");

		const formGroup = $("<div>")
			.addClass("form-group");

		const inputGroup = $("<div>")
			.addClass("input-group");

		const label = $("<span>")
			.addClass("input-group-text")
			.html("Steps in Process");

		const input = $("<input>")
			.attr("id", "steps-in-process")
			.addClass("form-control")
			.attr("type", "text")
			.attr("name", "steps")
			.attr("placeholder", "# of steps");

		const b1 = $("<button>")
			.attr("id", "buildTable")
			.addClass("btn")
			.addClass("btn-primary")
			.html("build");

		b1.on("click", function(e) { 
	        e.preventDefault();
	        callback($("#steps-in-process").val());
	    });

		const b2 = $("<button>")
			.attr("id", "clear")
			.addClass("btn")
			.addClass("btn-warning")
			.html("clear");

		b2.on("click", function(e) { 
	        e.preventDefault();
	        $("#steps-in-process").val('');
	        clearResults();
	    });

		inputGroup
			.append(label)
			.append(input)
			.append(b2)
			.append(b1);

		formGroup
			.append(inputGroup);

		body
			.append(formGroup);

		container
			.append(feature)
			.append(body);

		this.elementTarget
			.append(container);
	};

	this.addInstructions = function() { 
		const insWrap = $("<div>")
			.attr("id", selectors.instructionsContainerId);
		const ins = $("<p>")
			.html(config.instructions);
		insWrap.append(ins);
		this.elementTarget
			.append(insWrap);
	};

	this.addIntroText = function() { 
		const introWrap = $("<div>")
			.attr("id", selectors.introtextContainerId);
		const intro = $("<p>")
			.html(config.prebuildText);
		introWrap.append(intro);
		this.elementTarget
			.append(introWrap);
	};

	this.initUI = function(callback) { 
		this.elementTarget.empty();
		this.addIntroText();
		this.addDataInputs(callback);
	};

};

export {DomTools};
