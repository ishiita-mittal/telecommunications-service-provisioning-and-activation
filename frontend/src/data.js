
export const seed = {
 customers:[
  {id:"CUS-1001",name:"Rahul Sharma",email:"rahul.sharma@gmail.com",phone:"9876543210",plan:"5G Unlimited",status:"Active"},
  {id:"CUS-1002",name:"Priya Verma",email:"priya.verma@gmail.com",phone:"9876543211",plan:"Broadband 100 Mbps",status:"Active"},
  {id:"CUS-1003",name:"Amit Kumar",email:"amit.kumar@gmail.com",phone:"9876543212",plan:"4G Premium",status:"Pending"},
  {id:"CUS-1004",name:"Neha Singh",email:"neha.singh@gmail.com",phone:"9876543213",plan:"Fiber 200 Mbps",status:"Active"},
  {id:"CUS-1005",name:"Rohan Gupta",email:"rohan.gupta@gmail.com",phone:"9876543214",plan:"5G Basic",status:"Inactive"}],
 plans:[
  {id:1,planName:"5G Unlimited",planType:"Mobile",description:"Unlimited 5G data and voice calling.",monthlyPrice:999,dataLimitGb:999,validityDays:30,isAvailable:true},
  {id:2,planName:"Broadband 100 Mbps",planType:"Broadband",description:"High-speed home broadband connection.",monthlyPrice:699,dataLimitGb:500,validityDays:30,isAvailable:true},
  {id:3,planName:"4G Premium",planType:"Mobile",description:"Premium 4G data and unlimited calling.",monthlyPrice:599,dataLimitGb:100,validityDays:28,isAvailable:true},
  {id:4,planName:"Fiber 200 Mbps",planType:"Fiber",description:"Reliable fiber internet for home and office.",monthlyPrice:899,dataLimitGb:1000,validityDays:30,isAvailable:true},
  {id:5,planName:"5G Basic",planType:"Mobile",description:"Affordable 5G connectivity plan.",monthlyPrice:399,dataLimitGb:50,validityDays:28,isAvailable:false}],
 orders:[
  {id:"ORD-1001",customer:"Rahul Sharma",plan:"5G Unlimited",orderDate:"2026-11-10",status:"Completed"},
  {id:"ORD-1002",customer:"Priya Verma",plan:"Broadband 100 Mbps",orderDate:"2026-11-11",status:"In Progress"},
  {id:"ORD-1003",customer:"Amit Kumar",plan:"4G Premium",orderDate:"2026-11-12",status:"Pending"},
  {id:"ORD-1004",customer:"Neha Singh",plan:"Fiber 200 Mbps",orderDate:"2026-11-13",status:"Completed"},
  {id:"ORD-1005",customer:"Rohan Gupta",plan:"5G Basic",orderDate:"2026-11-14",status:"Failed"}],
 resources:[
  {id:1,identifier:"SIM-1001",type:"SIM Card",capacity:"1 User",location:"Delhi",status:"Available"},
  {id:2,identifier:"SIM-1002",type:"SIM Card",capacity:"1 User",location:"Noida",status:"Allocated"},
  {id:3,identifier:"FIB-2001",type:"Fiber Port",capacity:"1 Gbps",location:"Ghaziabad",status:"Available"},
  {id:4,identifier:"BB-3001",type:"Broadband Port",capacity:"500 Mbps",location:"Delhi",status:"Allocated"},
  {id:5,identifier:"NET-4001",type:"Network Capacity",capacity:"10 Gbps",location:"Noida",status:"Maintenance"}],
 tasks:[
  {id:1,taskId:"PRV-1001",orderId:"ORD-1001",customer:"Rahul Sharma",resource:"SIM-1001",taskType:"SIM Allocation",status:"Completed",createdDate:"2026-11-10"},
  {id:2,taskId:"PRV-1002",orderId:"ORD-1002",customer:"Priya Verma",resource:"FIB-2001",taskType:"Fiber Provisioning",status:"In Progress",createdDate:"2026-11-11"},
  {id:3,taskId:"PRV-1003",orderId:"ORD-1003",customer:"Amit Kumar",resource:"SIM-1002",taskType:"SIM Allocation",status:"Pending",createdDate:"2026-11-12"},
  {id:4,taskId:"PRV-1004",orderId:"ORD-1004",customer:"Neha Singh",resource:"FIB-2002",taskType:"Fiber Provisioning",status:"Completed",createdDate:"2026-11-13"}],
 activations:[
  {id:1,activationId:"ACT-1001",orderId:"ORD-1001",customer:"Rahul Sharma",service:"5G Unlimited",activationDate:"2026-11-10",status:"Active",testResult:"Passed"},
  {id:2,activationId:"ACT-1002",orderId:"ORD-1002",customer:"Priya Verma",service:"Broadband 100 Mbps",activationDate:"2026-11-11",status:"In Progress",testResult:"Pending"},
  {id:3,activationId:"ACT-1003",orderId:"ORD-1003",customer:"Amit Kumar",service:"4G Premium",activationDate:"2026-11-12",status:"Failed",testResult:"Failed"}],
 history:[
  {id:1,orderId:"ORD-1001",customer:"Rahul Sharma",previousStatus:"Pending",newStatus:"In Progress",updatedDate:"2026-11-10 10:30 AM",remarks:"Order validation started"},
  {id:2,orderId:"ORD-1001",customer:"Rahul Sharma",previousStatus:"In Progress",newStatus:"Completed",updatedDate:"2026-11-10 02:45 PM",remarks:"Service successfully activated"},
  {id:3,orderId:"ORD-1002",customer:"Priya Verma",previousStatus:"Pending",newStatus:"In Progress",updatedDate:"2026-11-11 11:15 AM",remarks:"Provisioning process started"}]
};
const KEY="telecomProDataV1";
export function readData(){try{const x=JSON.parse(localStorage.getItem(KEY));return x?{...seed,...x}:seed}catch{return seed}}
export function writeData(x){localStorage.setItem(KEY,JSON.stringify(x));window.dispatchEvent(new Event("telecompro-update"))}
export function idFor(prefix,items,field="id"){const n=items.reduce((m,x)=>Math.max(m,Number(String(x[field]||"").match(/\d+/)?.[0]||0)),1000)+1;return `${prefix}-${n}`}
