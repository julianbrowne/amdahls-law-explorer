
import {config} from "../src/js/config";
import {Amdahl} from "../src/js/amdahl";

test("initialise calculator", () => { 

	var amd = new Amdahl(10);

	var stepData = amd.getStepData();

	expect(stepData.length).toEqual(10);

	expect(stepData[0].id).toEqual(0);
	expect(stepData[0].time).toEqual(config.defaultStepTime);
	expect(stepData[0].percentage).toEqual(10.00);
	expect(amd.getStepData()[0].factor).toEqual(1.00);

	expect(stepData[1].id).toEqual(1);
	expect(stepData[1].time).toEqual(config.defaultStepTime);
	expect(stepData[1].percentage).toEqual(10.00);
	expect(stepData[1].factor).toEqual(1.00);

});

test("empty calculator", () => { 

	var amd = new Amdahl(0);

	expect(amd.updateSingleStepTimeData(0, 10)).toBeUndefined();
	expect(amd.getStepData()).toEqual([]);

});

test("update step times", () => { 

	var amd = new Amdahl(10);

	amd.updateStepTimes([2,2,2,2,2,2,2,2,2,2]);
	expect(amd.getStepData().length).toEqual(10);
	expect(amd.getTotalTime()).toEqual(20);

	amd.updateStepTimes([1,2,3,4,5,6,7,8,9,10]);
	expect(amd.getStepData().length).toEqual(10);
	expect(amd.getTotalTime()).toEqual(55);

});

test("update single step time", () => { 

	var amd = new Amdahl(3);

	amd.updateSingleStepTimeData(1, 10);
	const stepData = amd.getStepData();

	expect(stepData[0].time).toEqual(config.defaultStepTime);
	expect(stepData[1].time).toEqual(10.00);
	expect(stepData[2].time).toEqual(config.defaultStepTime);

	const totalTime = config.defaultStepTime + config.defaultStepTime + 10;
	const p1 = (config.defaultStepTime / totalTime)*100;
	const p2 = (10 / totalTime)*100;

	expect(stepData[0].percentage).toEqual(p1);
	expect(stepData[1].percentage).toEqual(p2);
	expect(stepData[2].percentage).toEqual(p1);

});

test("update step percentages", () => { 

	var amd = new Amdahl(10);

	amd.updateStepTimes([2,2,2,2,2,2,2,2,2,2]);
	expect(amd.getStepData()[3].percentage).toEqual(10.00);

	amd.updateStepTimes([1,2,3,4,5,6,7,8,9,10]);
	expect(amd.getStepData()[6].percentage).toEqual(12.73);

	var amd = new Amdahl(3);
	expect(amd.getStepData()[0].percentage).toEqual(33.33);

});

