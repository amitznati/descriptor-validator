const convert = new X2JS();
const validateDescriptor = (descriptor, contentXML) => {

	const xmlContentName = Object.keys(
		contentXML.root.content.root.responsivegrid
	)[0];

	const contentFromXML = Object.keys(
		contentXML.root.content.root.responsivegrid[xmlContentName])
		.map(xmlName => {
			return xmlName.replace(/^_content\.|\.Text$/g, "");
		})
		.filter(
			n =>
				!n.startsWith("_jcr") &&
				!n.startsWith("_behavior") &&
				!n.startsWith("_outcomes") &&
				!n.startsWith("_sling") &&
				!n.startsWith("_singleton")
		);

	const contentFromDesc = descriptor.content;

	const notExistInXml = [];
	const notExistInDesc = [];

	contentFromDesc.forEach(cont => {
		if (!contentFromXML.includes(cont.itemId)) {
			notExistInXml.push(cont);
		}
	});

	contentFromXML.forEach(itemId => {
		if (
			!contentFromDesc.find(
				item => item.itemId === itemId || item.actionId === itemId
			)
		) {
			notExistInDesc.push(itemId);
		}
	});

	console.log("notExistInDesc", notExistInDesc);
	console.log("notExistInXml", notExistInXml);
	notExistInXml.forEach(item =>
		console.log(`content.${item.itemId}.Text="${item.defaultValue}"`)
	);

	return {notExistInDesc, notExistInXml};

}

function ViewModel() {
	self = this;
	self.isFilesLoaded = ko.observable(false);
	// Descriptor
	self.descriptorObj = ko.observable(null);
	self.descriptorMissingContent = ko.observableArray();
	self.isDescriptorMissingContentVisible = ko.observable(false);
	self.showDescriptorMissingContent = function(){
		self.isDescriptorMissingContentVisible(!self.isDescriptorMissingContentVisible());
	}

	self.onFilesLoaded = function() {
		const {notExistInDesc, notExistInXml} = validateDescriptor(self.descriptorObj(), self.contentObj());
		self.contentMissingContent(notExistInXml.map(item => ({name: item.itemId})));
		self.descriptorMissingContent(notExistInDesc.map(item => ({name: item})));
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
	self.isContentMissingContentVisible = ko.observable(false);
	self.showContentMissingContent = function(){
		self.isContentMissingContentVisible(!self.isContentMissingContentVisible());
	}

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
