import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as jsx from 'react/jsx-runtime';
import { isEnrollmentClick } from '../lib/matricula/click-events';

function load(file: string, deps: Record<string, unknown>, globals: object = {}) {
  const module = { exports: {} as any };
  const code = ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  vm.runInNewContext(code,{module,exports:module.exports,require:(name:string)=>{if(!(name in deps)) throw new Error(name); return deps[name];},Intl,Date,URL,process,...globals});
  return module.exports;
}
test('anonymous payload rejects personal data and invalid events',()=>{
  const body={event:'click_inscribir_alumno',id:'11111111-1111-4111-8111-111111111111'};
  assert.ok(isEnrollmentClick(body));
  assert.ok(!isEnrollmentClick({...body,email:'privado@example.test'}));
  assert.ok(!isEnrollmentClick({...body,event:'__proto__'}));
  assert.ok(!isEnrollmentClick({...body,id:'no-uuid'}));
});
test('analytics keeps private pages excluded and strips query strings from public events',()=>{
  const { default: Analytics } = load('app/WebAnalytics.tsx',{'next/navigation':{usePathname:()=>'/reserva-matricula/'},'@vercel/analytics/next':{Analytics:'analytics'},'react/jsx-runtime':jsx});
  const filter=Analytics().props.beforeSend;
  assert.equal(filter({type:'event',url:'https://colegio.invalid/personal/super-admin/'}),null);
  assert.equal(filter({type:'pageview',url:'https://colegio.invalid/api/matriculas/'}),null);
  assert.equal(filter({type:'event',url:'https://colegio.invalid/otra-pagina/'}),null);
  assert.equal(filter({type:'event',url:'https://colegio.invalid/reserva-matricula/?correo=privado#rut'}).url,'https://colegio.invalid/reserva-matricula/');
});
test('analytics failure cannot prevent first-party counting or form opening',async()=>{
  const calls: any[]=[];
  const {trackEnrollmentClick}=load('lib/matricula/track-click.ts',{'@vercel/analytics':{track:()=>{throw new Error('blocked');}}},{crypto:{randomUUID:()=> '11111111-1111-4111-8111-111111111111'},fetch:(url:string,options:any)=>{calls.push({url,...options});return Promise.reject(new Error('offline'));}});
  assert.doesNotThrow(()=>trackEnrollmentClick('click_inscribir_alumno'));
  await new Promise(resolve=>setTimeout(resolve,0));
  assert.equal(calls.length,1);
  assert.deepEqual(JSON.parse(calls[0].body),{event:'click_inscribir_alumno',id:'11111111-1111-4111-8111-111111111111'});
});
test('both entry buttons share the form and preserve entered state on repeat clicks',()=>{
  const state:any[]=[],refs:any[]=[],tracked:string[]=[]; let index=0,ri=0;
  const react={useState:(initial:any)=>{const i=index++;if(!(i in state))state[i]=typeof initial==='function'?initial():initial;return [state[i],(value:any)=>{state[i]=typeof value==='function'?value(state[i]):value;}];},useRef:()=>{const i=ri++;return refs[i]??(refs[i]={current:null});},useEffect:()=>{}};
  const mod=load('app/reserva-matricula/ReservationSteps.tsx',{'react':react,'react/jsx-runtime':jsx,'./HelpContact':{default:()=>null},'@/lib/matricula/fields':{enrollmentCourses:[]},'@/lib/matricula/validation':{},'@/lib/matricula/capitalization':{},'@/lib/matricula/track-click':{trackEnrollmentClick:(event:string)=>tracked.push(event)}});
  const wrapper=mod.default({}); const render=()=>{index=1;ri=0;return wrapper.type(wrapper.props);};
  function all(node:any):any[]{if(!node||typeof node!=='object')return [];return [node,...[node.props?.children].flat(Infinity).flatMap(all)];}
  let nodes=all(render()); const buttons=()=>nodes.filter(n=>n.type==='button'&&n.props['aria-controls']==='formulario-matricula');
  assert.equal(buttons().length,2); assert.equal(buttons()[1].props.children,'INSCRIBIR ALUMNO');
  assert.equal(nodes.find(n=>n.props?.id==='formulario-matricula').props.hidden,true);
  buttons()[1].props.onClick(); nodes=all(render());
  assert.equal(nodes.find(n=>n.props?.id==='formulario-matricula').props.hidden,false);
  const entered=nodes.find(n=>n.type==='input'&&n.props.name==='nombres');
  assert.ok(entered?.props.onChange); entered.props.onChange({currentTarget:{value:'Valentina'}});nodes=all(render());
  const before=JSON.stringify(state); buttons()[0].props.onClick();nodes=all(render());
  assert.equal(JSON.stringify(state),before);assert.deepEqual(tracked,['click_inscribir_alumno','click_pre_matricula_2027']);
});
