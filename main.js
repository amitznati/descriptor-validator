const convert = new X2JS();
const validateDescriptor = (descriptor, contentXML) => {

	const xmlContentName = Object.keys(
		contentXML.root.content.root.responsivegrid
	)[0];

	const contentFromXML = [];
	const behaviorFromXML = [];
	const outcomesFromXML = [];
	Object.keys(
		contentXML.root.content.root.responsivegrid[xmlContentName])
		.forEach(xmlName => {
			if(xmlName.startsWith('_content')) {
				contentFromXML.push(xmlName.replace(/^_content\.|\.Text$/g, ""));
			} else if (xmlName.startsWith('_behavior') && xmlName.endsWith('.text')) {
				behaviorFromXML.push(xmlName.replace(/^_behavior\.|\.text$/g, ""))
			} else if (xmlName.startsWith('_behavior') && xmlName.endsWith('.bool')) {
				behaviorFromXML.push(xmlName.replace(/^_behavior\.|\.bool$/g, ""))
			} else if (xmlName.startsWith('_outcomes')) {
				outcomesFromXML.push(xmlName.replace(/^_outcomes\.|\.navigate$/g, ""))
			}
		});

	const contentFromDesc = descriptor.content;
	const behaviorFromDesc = descriptor.behaviorParams;
	const outcomesFromDesc = descriptor.outcomes;

	const notExistContentInXml = [];
	const notExistContentInDesc = [];

	const notExistBehaviorInXml = [];
	const notExistBehaviorInDesc = [];

	const notExistOutcomesInXml = [];
	const notExistOutcomesInDesc = [];

	const check = (fromDesc, fromXml, fieldName, notExistDescArr, notExistXmlArr ) => {
		fromDesc.forEach(cont => {
			if (!fromXml.includes(cont[fieldName])) {
				notExistXmlArr.push({name: cont[fieldName]});
			}
		});

		fromXml.forEach(itemId => {
			if (!fromDesc.find(item => item[fieldName] === itemId)) {
				notExistDescArr.push({name: itemId});
			}
		});
	}

	check(contentFromDesc, contentFromXML, 'itemId', notExistContentInDesc, notExistContentInXml);
	check(behaviorFromDesc, behaviorFromXML, 'itemId', notExistBehaviorInDesc, notExistBehaviorInXml);
	check(outcomesFromDesc, outcomesFromXML, 'actionId', notExistOutcomesInDesc, notExistOutcomesInXml);

	console.log("notExistContentInDesc", notExistContentInDesc);
	console.log("notExistContentInXml", notExistContentInXml);
	notExistContentInXml.forEach(item =>
		console.log(`content.${item.name}.Text="${item.defaultValue}"`)
	);

	return {
		notExistContentInDesc,
		notExistContentInXml,
		notExistBehaviorInXml,
		notExistBehaviorInDesc,
		notExistOutcomesInXml,
		notExistOutcomesInDesc
	};
}

function ViewModel() {
	self = this;
	self.isFilesLoaded = ko.observable(false);
	// Descriptor
	self.descriptorObj = ko.observable(null);
	self.descriptorMissingContent = ko.observableArray();
	self.notExistContentInDesc = ko.observable(null);
	self.notExistContentInXml = ko.observable(null);
	self.notExistBehaviorInXml = ko.observable(null);
	self.notExistBehaviorInDesc = ko.observable(null);
	self.notExistOutcomesInXml = ko.observable(null);
	self.notExistOutcomesInDesc = ko.observable(null);
	self.isAllGood = ko.observable(false);
	self.onFilesLoaded = function() {
		const {
			notExistContentInDesc,
			notExistContentInXml,
			notExistBehaviorInXml,
			notExistBehaviorInDesc,
			notExistOutcomesInXml,
			notExistOutcomesInDesc
		} = validateDescriptor(self.descriptorObj(), self.contentObj());
		self.notExistContentInDesc(notExistContentInDesc);
		self.notExistContentInXml(notExistContentInXml);
		self.notExistBehaviorInXml(notExistBehaviorInXml);
		self.notExistBehaviorInDesc(notExistBehaviorInDesc);
		self.notExistOutcomesInXml(notExistOutcomesInXml);
		self.notExistOutcomesInDesc(notExistOutcomesInDesc);
		self.isAllGood(
			!notExistContentInDesc.length &&
			!notExistContentInXml.length &&
			!notExistBehaviorInXml.length &&
			!notExistBehaviorInDesc.length &&
			!notExistOutcomesInXml.length &&
			!notExistOutcomesInDesc.length
		);
		self.isFilesLoaded(true);
	}

	self.openDescriptorFile = function(data, event) {
		var input = event.target;
		var reader = new FileReader();
		reader.onload = function(){
			var text = reader.result.trim();
			const json = JSON.parse(text);
			console.log('json', json);
			self.descriptorObj(json);
			if (self.contentObj()) {
				self.onFilesLoaded();
			}
		};
		reader.readAsText(input.files[0]);
	};

	// END Descriptor
	// Content
	self.contentObj = ko.observable(null);
	self.contentMissingContent = ko.observableArray();

	self.openContentFile = function(data, event) {
		var input = event.target;
		var reader = new FileReader();
		reader.onload = function(){
			const text = reader.result.trim();
			// console.log('text', text);
			const xml = convert.parseXmlString(text);
			// console.log('xml', xml);
			const json = convert.xml2json(xml);
			console.log('json', json);
			self.contentObj(json);
			if (self.descriptorObj()) {
				self.onFilesLoaded();
			}
		};
		reader.readAsText(input.files[0]);
	};



}
const myViewModel = new ViewModel();

ko.applyBindings(myViewModel);
