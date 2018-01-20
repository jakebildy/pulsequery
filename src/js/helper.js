import domtoimage from 'dom-to-image';

const Helper = {

	getImageUrlForDom: async function (node) {
		var ret;
		await domtoimage.toPng(node)
			.then(function (url) {
				ret = url;
			});
    	return ret;
	}

};

export default Helper;