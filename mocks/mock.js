'use strict';

class Mock {

	static restore(method) {
		if(method)
			this._restoreMethod(method);
		else if(this.stubs)
			Object.keys(this.stubs).forEach(m => this._restoreMethod(m));
	}

	static _restoreMethod(method) {
		if(this.stubs && this.stubs[method]) {
			this.stubs[method].restore();
			delete this.stubs[method];
		}
	}

	static addStub(method, stub) {
		if(!this.stubs)
			this.stubs = {};

		this.stubs[method] = stub;
	}

}

module.exports = Mock;
