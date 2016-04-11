import {bootstrap} from 'angular2/platform/browser';
import {provide} from 'angular2/core';
import {HTTP_PROVIDERS} from 'angular2/http';
import {ROUTER_PROVIDERS, LocationStrategy, HashLocationStrategy} from 'angular2/router';

import {enableProdMode} from 'angular2/core';
enableProdMode();

import 'fabric-browseronly/index';

import {ImageSelector,UrlSet} from './app/image-selector';

window.ImageSelectorApp = function(uploadUrl:string, saveUrl:string, onFinish:any, baseUrl:string) {
    let urlSet: UrlSet = {uploadUrl: uploadUrl, saveUrl: saveUrl, onFinish:onFinish ? onFinish: ()=>{}, baseUrl};
    bootstrap(ImageSelector, [
    HTTP_PROVIDERS,
    provide(LocationStrategy, {useClass: HashLocationStrategy}),
    provide(UrlSet, {useValue: <UrlSet> urlSet})
    ])
    .catch(err => console.error(err));
}
