export const VERSION = 1;
export const TASKS = ['Confirm patient is comfortable at home', 'Review approved discharge instructions', 'Check access to meals and daily essentials', 'Confirm follow-up appointment details'];
export function seed(now = new Date()) {
  const ago = h => new Date(now.getTime() - h * 3600000).toISOString();
  const date = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const people = [
    ['p1','Eleanor Bennett',68,'Post-operative support','Mobility assistance and help settling in at home.','c1',22,'EB','peach'],
    ['p2','James Wilson',74,'Daily living support','Meal preparation and appointment coordination.','c2',46,'JW','blue'],
    ['p3','Sofia Martinez',59,'Recovery support','Practical support with daily activities.','c1',9,'SM','lavender'],
    ['p4','Robert Chen',71,'Transition support','Help arranging transport to the follow-up appointment.','c3',33,'RC','mint'],
    ['p5','Amara Johnson',63,'Post-operative support','Support with meals and household essentials.','c2',61,'AJ','pink'],
    ['p6','William Parker',77,'Daily living support','Companionship and support with the discharge checklist.',null,4,'WP','sand']
  ];
  return { version: VERSION, patients: people.map(([id,name,age,reason,needs,caregiver,elapsed,initials,color])=>({id,name,age,reason,needs,caregiver,discharged:ago(elapsed),initials,color,language:id==='p3'?'Spanish / English':'English',contact:'Demo care team · (555) 010-0072',plan:'Follow the hospital-approved discharge instructions. Provide only the assigned practical support. Contact the care team about concerns or unclear instructions.',followup:'Follow-up with the discharge team in 5 days',created:ago(elapsed),closed:false})),
    caregivers:[{id:'c1',name:'Maya Patel',initials:'MP',color:'lavender',role:'CNA student · supervised',language:'English, Spanish',available:true,experience:'Daily living support',supervisor:'Emma Davis, RN'},{id:'c2',name:'Daniel Brooks',initials:'DB',color:'blue',role:'Certified nursing assistant',language:'English',available:true,experience:'Mobility & home support',supervisor:'Emma Davis, RN'},{id:'c3',name:'Olivia Reed',initials:'OR',color:'peach',role:'Certified nursing assistant',language:'English, Mandarin',available:true,experience:'Recovery support',supervisor:'Emma Davis, RN'}],
    visits:[{id:'v1',patientId:'p1',caregiverId:'c1',date,time:'09:00',duration:60,status:'scheduled',tasks:[],note:''},{id:'v2',patientId:'p2',caregiverId:'c2',date,time:'10:30',duration:60,status:'completed',tasks:[0,1,2,3],note:'Patient reports feeling settled. Meals are available and the follow-up appointment is confirmed.'},{id:'v3',patientId:'p3',caregiverId:'c1',date,time:'13:00',duration:60,status:'scheduled',tasks:[],note:''},{id:'v4',patientId:'p4',caregiverId:'c3',date,time:'14:30',duration:60,status:'scheduled',tasks:[],note:''},{id:'v5',patientId:'p5',caregiverId:'c2',date,time:'16:00',duration:60,status:'scheduled',tasks:[],note:''}],
    alerts:[{id:'a1',patientId:'p4',title:'Follow-up transport needs arranging',detail:'Robert reports that his family cannot drive him to his follow-up appointment. Please coordinate transport.',status:'new',created:ago(1.2),author:'Olivia Reed',resolution:''}],
    events:[{id:'e1',patientId:'p2',title:'Home visit completed',detail:'Daniel confirmed daily essentials and the follow-up appointment.',author:'Daniel Brooks',at:ago(.8)},{id:'e2',patientId:'p4',title:'Care team notified',detail:'Transport support requested for the follow-up appointment.',author:'Olivia Reed',at:ago(1.2)},{id:'e3',patientId:'p1',title:'Caregiver assigned',detail:'Maya Patel will help Eleanor settle in at home.',author:'Emma Davis, RN',at:ago(2)},{id:'e4',patientId:'p6',title:'New referral received',detail:'William is ready for a caregiver assignment.',author:'Emma Davis, RN',at:ago(4)}] };
}
export function hoursSince(patient, now = new Date()) { return Math.max(0, Math.floor((now - new Date(patient.discharged)) / 3600000)); }
export function patientsFor(state, session) { return state.patients.filter(p => session.role === 'nurse' || (session.role === 'caregiver' ? p.caregiver === session.personId : p.id === session.personId)); }
export function visibleState(state, session) { const patients = patientsFor(state, session), ids = new Set(patients.map(p=>p.id)); return {...state,patients,visits:state.visits.filter(v=>ids.has(v.patientId)),alerts:state.alerts.filter(a=>ids.has(a.patientId)),events:state.events.filter(e=>ids.has(e.patientId))}; }
export function event(state,patientId,title,detail,author) { state.events.unshift({id:crypto.randomUUID(),patientId,title,detail,author,at:new Date().toISOString()}); }
export function hasConflict(state,caregiverId,date,time,duration=60,excludeId=null) { const minutes=t=>Number(t.split(':')[0])*60+Number(t.split(':')[1]), start=minutes(time); return state.visits.some(v=>v.id!==excludeId&&v.caregiverId===caregiverId&&v.date===date&&v.status!=='cancelled'&&start<minutes(v.time)+v.duration&&start+duration>minutes(v.time)); }
export function summaryFor(state,patientId) {
  const p=state.patients.find(p=>p.id===patientId); if(!p)return null;
  const visit=state.visits.filter(v=>v.patientId===patientId&&v.note).sort((a,b)=>(b.updated||b.date).localeCompare(a.updated||a.date))[0];
  const alerts=state.alerts.filter(a=>a.patientId===patientId&&a.status!=='resolved');
  return { heading: `${p.name.split(' ')[0]}'s care, at a glance`, support:p.needs, update:visit?visit.note:'No caregiver visit note has been submitted yet.',next:alerts.length?`${alerts.length} open concern${alerts.length>1?'s':''} for the care team: ${alerts.map(a=>a.title).join('; ')}.`:p.followup,sources:[{label:'Discharge handoff',date:p.created},...(visit?[{label:'Caregiver visit note',date:visit.updated||visit.date}]:[]),...(alerts.length?[{label:'Care team concerns',date:alerts[0].created}]:[])]};
}
