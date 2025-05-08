import {
  NG_VALUE_ACCESSOR
} from "./chunk-WD44CKSE.js";
import {
  CommonModule,
  DOCUMENT,
  NgIf
} from "./chunk-YZ74CSPA.js";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Injectable,
  Input,
  NgModule,
  NgZone,
  Optional,
  Output,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  forwardRef,
  makeEnvironmentProviders,
  numberAttribute,
  setClassMetadata,
  ɵɵNgOnChangesFeature,
  ɵɵProvidersFeature,
  ɵɵadvance,
  ɵɵattribute,
  ɵɵdefineComponent,
  ɵɵdefineInjectable,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵdirectiveInject,
  ɵɵelement,
  ɵɵelementContainerEnd,
  ɵɵelementContainerStart,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵinject,
  ɵɵnextContext,
  ɵɵprojection,
  ɵɵprojectionDef,
  ɵɵproperty,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate
} from "./chunk-ALFF6IRD.js";
import "./chunk-4N4GOYJH.js";
import "./chunk-5OPE3T2R.js";
import {
  BehaviorSubject,
  filter,
  pipe,
  share
} from "./chunk-FHTVLBLO.js";
import {
  __async,
  __spreadProps,
  __spreadValues
} from "./chunk-TXDUYLVM.js";

// node_modules/@ng-util/lazy/fesm2022/ng-util-lazy.mjs
var NuLazyService = class _NuLazyService {
  constructor(doc) {
    this.doc = doc;
    this.list = {};
    this.cached = {};
    this._notify = new BehaviorSubject([]);
  }
  fixPaths(paths) {
    paths = paths || [];
    if (!Array.isArray(paths)) {
      paths = [paths];
    }
    return paths.map((p) => {
      const res = typeof p === "string" ? {
        path: p
      } : p;
      if (!res.type) {
        res.type = res.path.endsWith(".js") || res.callback ? "script" : "style";
      }
      return res;
    });
  }
  /**
   * Monitor for the finished of `paths`
   *
   * - It's recommended to pass the value in accordance with the `load()` method
   */
  monitor(paths) {
    const libs = this.fixPaths(paths);
    const pipes = [share(), filter((ls) => ls.length !== 0)];
    if (libs.length > 0) {
      pipes.push(filter((ls) => ls.length === libs.length && ls.every((v) => v.status === "ok" && libs.find((lw) => lw.path === v.path))));
    }
    return this._notify.asObservable().pipe(pipe.apply(this, pipes));
  }
  clear() {
    this.list = {};
    this.cached = {};
  }
  /**
   * Load the specified resources, includes `.js`, `.css`
   *
   * - The returned Promise does not mean that it was successfully loaded
   * - You can monitor load is success via `monitor()`
   */
  load(paths) {
    return __async(this, null, function* () {
      paths = this.fixPaths(paths);
      return Promise.all(paths.map((p) => p.type === "script" ? this.loadScript(p.path, {
        callback: p.callback
      }) : this.loadStyle(p.path))).then((res) => {
        this._notify.next(res);
        return Promise.resolve(res);
      });
    });
  }
  loadScript(path, options) {
    const {
      innerContent
    } = __spreadValues({}, options);
    return new Promise((resolve) => {
      if (this.list[path] === true) {
        resolve(__spreadProps(__spreadValues({}, this.cached[path]), {
          status: "loading"
        }));
        return;
      }
      this.list[path] = true;
      const onSuccess = (item) => {
        if (item.status === "ok" && options?.callback) {
          window[options?.callback] = () => {
            onSuccessTruth(item);
          };
        } else {
          onSuccessTruth(item);
        }
      };
      const onSuccessTruth = (item) => {
        item.type = "script";
        this.cached[path] = item;
        resolve(item);
        this._notify.next([item]);
      };
      const node = this.doc.createElement("script");
      node.type = "text/javascript";
      node.src = path;
      node.charset = "utf-8";
      if (innerContent) {
        node.innerHTML = innerContent;
      }
      if (node.readyState) {
        node.onreadystatechange = () => {
          if (node.readyState === "loaded" || node.readyState === "complete") {
            node.onreadystatechange = null;
            onSuccess({
              path,
              status: "ok"
            });
          }
        };
      } else {
        node.onload = () => onSuccess({
          path,
          status: "ok"
        });
      }
      node.onerror = (error) => onSuccess({
        path,
        status: "error",
        error
      });
      this.doc.getElementsByTagName("head")[0].appendChild(node);
    });
  }
  loadStyle(path, options) {
    const {
      rel,
      innerContent
    } = __spreadValues({
      rel: "stylesheet"
    }, options);
    return new Promise((resolve) => {
      if (this.list[path] === true) {
        resolve(this.cached[path]);
        return;
      }
      this.list[path] = true;
      const node = this.doc.createElement("link");
      node.rel = rel;
      node.type = "text/css";
      node.href = path;
      if (innerContent) {
        node.innerHTML = innerContent;
      }
      this.doc.getElementsByTagName("head")[0].appendChild(node);
      const item = {
        path,
        status: "ok",
        type: "style"
      };
      this.cached[path] = item;
      resolve(item);
    });
  }
  static {
    this.ɵfac = function NuLazyService_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _NuLazyService)(ɵɵinject(DOCUMENT));
    };
  }
  static {
    this.ɵprov = ɵɵdefineInjectable({
      token: _NuLazyService,
      factory: _NuLazyService.ɵfac,
      providedIn: "root"
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NuLazyService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [{
    type: void 0,
    decorators: [{
      type: Inject,
      args: [DOCUMENT]
    }]
  }], null);
})();

// node_modules/ngx-tinymce/fesm2022/ngx-tinymce.mjs
var _c0 = ["*"];
function TinymceComponent_textarea_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "textarea", 3);
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵattribute("id", ctx_r0.id)("placeholder", ctx_r0.placeholder);
  }
}
function TinymceComponent_div_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "div");
    ɵɵprojection(1);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵattribute("id", ctx_r0.id);
  }
}
function TinymceComponent_div_2_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵtext(1);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(2);
    ɵɵadvance();
    ɵɵtextInterpolate(ctx_r0._loading);
  }
}
function TinymceComponent_div_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "div", 4);
    ɵɵtemplate(1, TinymceComponent_div_2_ng_container_1_Template, 2, 1, "ng-container", 5);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r0._loading)("ngIfElse", ctx_r0._loadingTpl);
  }
}
var TinymceOptions = class {
  constructor() {
    this.baseURL = "./assets/tinymce/";
    this.fileName = "tinymce.min.js";
  }
};
var isSSR = !(typeof document === "object" && !!document);
var TinymceComponent = class _TinymceComponent {
  set disabled(value) {
    this._disabled = value;
    this.setDisabled();
  }
  set loading(value) {
    if (value instanceof TemplateRef) {
      this._loading = null;
      this._loadingTpl = value;
    } else {
      this._loading = value;
    }
  }
  get instance() {
    return this._instance;
  }
  _getWin() {
    return this.doc.defaultView || window;
  }
  constructor(defConfig, lazySrv, ngZone, doc, cd) {
    this.defConfig = defConfig;
    this.lazySrv = lazySrv;
    this.ngZone = ngZone;
    this.doc = doc;
    this.cd = cd;
    this.value = "";
    this.load = true;
    this.id = `_tinymce-${Math.random().toString(36).substring(2)}`;
    this.placeholder = "";
    this.inline = false;
    this._disabled = false;
    this._loading = null;
    this._loadingTpl = null;
    this.delay = 0;
    this.ready = new EventEmitter();
  }
  initDelay() {
    if (isSSR) {
      return;
    }
    setTimeout(() => this.init(), Math.max(0, this.delay));
  }
  init() {
    const win = this._getWin();
    if (!win.tinymce) {
      throw new Error("tinymce js文件加载失败");
    }
    const {
      defConfig,
      config,
      id,
      inline
    } = this;
    if (this._instance) {
      return;
    }
    if (defConfig?.baseURL) {
      let url = "" + defConfig.baseURL;
      if (url.endsWith("/")) {
        url = url.substring(0, url.length - 1);
      }
      win.tinymce.baseURL = url;
    }
    const userOptions = __spreadValues(__spreadValues({}, defConfig?.config), config);
    const options = __spreadProps(__spreadValues(__spreadValues({
      selector: `#` + id,
      inline
    }, defConfig?.config), config), {
      setup: (editor) => {
        this._instance = editor;
        if (this.onChange) {
          editor.on("change keyup", () => {
            this.value = editor.getContent();
            this.ngZone.run(() => this.onChange(this.value));
          });
        }
        if (typeof userOptions.setup === "function") {
          userOptions.setup(editor);
        }
      },
      init_instance_callback: (editor) => {
        if (editor && this.value) {
          editor.setContent(this.value);
        }
        this.setDisabled();
        if (typeof userOptions.init_instance_callback === "function") {
          userOptions.init_instance_callback(editor);
        }
        this.ready.emit(editor);
      }
    });
    if (userOptions.auto_focus) {
      options.auto_focus = id;
    }
    this.ngZone.runOutsideAngular(() => win.tinymce.init(options));
    this.load = false;
    this.cd.detectChanges();
  }
  destroy() {
    if (this._instance == null) {
      return;
    }
    this.ngZone.runOutsideAngular(() => {
      this._instance.off();
      this._instance.remove();
    });
    this._instance = null;
  }
  setDisabled() {
    if (!this._instance) {
      return;
    }
    this.ngZone.runOutsideAngular(() => {
      const mode = this._disabled ? "readonly" : "design";
      const setMode5 = this._instance.setMode;
      if (typeof setMode5 === "function") {
        setMode5(mode);
      } else {
        this._instance.mode.set(mode);
      }
    });
  }
  ngAfterViewInit() {
    if (isSSR) {
      return;
    }
    if (this._getWin().tinymce) {
      this.initDelay();
      return;
    }
    const {
      defConfig
    } = this;
    const baseURL = defConfig && defConfig.baseURL;
    const fileName = defConfig && defConfig.fileName;
    const url = (baseURL || "./assets/tinymce/") + (fileName || "tinymce.min.js");
    this.lazySrv.monitor(url).subscribe(() => this.initDelay());
    this.lazySrv.load(url);
  }
  ngOnChanges(changes) {
    if (this._instance && changes.config) {
      this.destroy();
      this.initDelay();
    }
  }
  ngOnDestroy() {
    this.destroy();
  }
  writeValue(value) {
    this.value = value || "";
    if (this._instance) {
      this.ngZone.runOutsideAngular(() => this._instance.setContent(this.value));
    }
  }
  registerOnChange(fn) {
    this.onChange = fn;
  }
  registerOnTouched(fn) {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled) {
    this.disabled = isDisabled;
    this.setDisabled();
  }
  static {
    this.ɵfac = function TinymceComponent_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _TinymceComponent)(ɵɵdirectiveInject(TinymceOptions, 8), ɵɵdirectiveInject(NuLazyService), ɵɵdirectiveInject(NgZone), ɵɵdirectiveInject(DOCUMENT), ɵɵdirectiveInject(ChangeDetectorRef));
    };
  }
  static {
    this.ɵcmp = ɵɵdefineComponent({
      type: _TinymceComponent,
      selectors: [["tinymce"]],
      inputs: {
        config: "config",
        placeholder: "placeholder",
        inline: [2, "inline", "inline", booleanAttribute],
        disabled: [2, "disabled", "disabled", booleanAttribute],
        loading: "loading",
        delay: [2, "delay", "delay", numberAttribute]
      },
      outputs: {
        ready: "ready"
      },
      exportAs: ["tinymce"],
      features: [ɵɵProvidersFeature([{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => _TinymceComponent),
        multi: true
      }]), ɵɵNgOnChangesFeature],
      ngContentSelectors: _c0,
      decls: 3,
      vars: 3,
      consts: [["class", "tinymce-selector", 4, "ngIf"], [4, "ngIf"], ["class", "loading", 4, "ngIf"], [1, "tinymce-selector"], [1, "loading"], [4, "ngIf", "ngIfElse"]],
      template: function TinymceComponent_Template(rf, ctx) {
        if (rf & 1) {
          ɵɵprojectionDef();
          ɵɵtemplate(0, TinymceComponent_textarea_0_Template, 1, 2, "textarea", 0)(1, TinymceComponent_div_1_Template, 2, 1, "div", 1)(2, TinymceComponent_div_2_Template, 2, 2, "div", 2);
        }
        if (rf & 2) {
          ɵɵproperty("ngIf", !ctx.inline);
          ɵɵadvance();
          ɵɵproperty("ngIf", ctx.inline);
          ɵɵadvance();
          ɵɵproperty("ngIf", ctx.load);
        }
      },
      dependencies: [NgIf],
      styles: ["tinymce .tinymce-selector{display:none}\n"],
      encapsulation: 2,
      changeDetection: 0
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(TinymceComponent, [{
    type: Component,
    args: [{
      selector: "tinymce",
      exportAs: "tinymce",
      template: `
    <textarea *ngIf="!inline" [attr.id]="id" [attr.placeholder]="placeholder" class="tinymce-selector"></textarea>
    <div *ngIf="inline" [attr.id]="id"><ng-content></ng-content></div>
    <div class="loading" *ngIf="load">
      <ng-container *ngIf="_loading; else _loadingTpl">{{ _loading }}</ng-container>
    </div>
  `,
      providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => TinymceComponent),
        multi: true
      }],
      preserveWhitespaces: false,
      encapsulation: ViewEncapsulation.None,
      changeDetection: ChangeDetectionStrategy.OnPush,
      standalone: true,
      imports: [NgIf],
      styles: ["tinymce .tinymce-selector{display:none}\n"]
    }]
  }], () => [{
    type: TinymceOptions,
    decorators: [{
      type: Optional
    }]
  }, {
    type: NuLazyService
  }, {
    type: NgZone
  }, {
    type: void 0,
    decorators: [{
      type: Inject,
      args: [DOCUMENT]
    }]
  }, {
    type: ChangeDetectorRef
  }], {
    config: [{
      type: Input
    }],
    placeholder: [{
      type: Input
    }],
    inline: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    disabled: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    loading: [{
      type: Input
    }],
    delay: [{
      type: Input,
      args: [{
        transform: numberAttribute
      }]
    }],
    ready: [{
      type: Output
    }]
  });
})();
var NgxTinymceModule = class _NgxTinymceModule {
  static forRoot(options) {
    return {
      ngModule: _NgxTinymceModule,
      providers: [{
        provide: TinymceOptions,
        useValue: options
      }]
    };
  }
  static {
    this.ɵfac = function NgxTinymceModule_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _NgxTinymceModule)();
    };
  }
  static {
    this.ɵmod = ɵɵdefineNgModule({
      type: _NgxTinymceModule,
      imports: [CommonModule, TinymceComponent],
      exports: [TinymceComponent]
    });
  }
  static {
    this.ɵinj = ɵɵdefineInjector({
      imports: [CommonModule]
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NgxTinymceModule, [{
    type: NgModule,
    args: [{
      imports: [CommonModule, TinymceComponent],
      exports: [TinymceComponent]
    }]
  }], null, null);
})();
function provideTinymce(options) {
  return makeEnvironmentProviders([{
    provide: TinymceOptions,
    useValue: options
  }]);
}
export {
  NgxTinymceModule,
  TinymceComponent,
  TinymceOptions,
  provideTinymce
};
//# sourceMappingURL=ngx-tinymce.js.map
