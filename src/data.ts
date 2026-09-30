export type Watershed={id:string;name:string;district:string;state:string;area:number;lat:number;lng:number;veg:number;water:number;interventions:number;coordinates:[number,number][]};
export const watersheds:Watershed[]=[
{id:'WS-UP-LKO-024',name:'Rampur',district:'Lucknow',state:'Uttar Pradesh',area:2450,lat:26.8467,lng:80.9462,veg:41,water:7,interventions:52,coordinates:[[26.891,80.91],[26.9,80.96],[26.875,81.003],[26.832,81.012],[26.8,80.972],[26.812,80.92]]},
{id:'WS-UP-LKO-018',name:'Mohanlalganj',district:'Lucknow',state:'Uttar Pradesh',area:1860,lat:26.72,lng:80.99,veg:36,water:5.4,interventions:38,coordinates:[[26.777,80.95],[26.792,81.01],[26.748,81.047],[26.695,81.027],[26.687,80.98],[26.725,80.94]]},
{id:'WS-UP-SIT-011',name:'Gosainganj',district:'Lucknow',state:'Uttar Pradesh',area:3120,lat:26.78,lng:81.13,veg:48,water:8.2,interventions:67,coordinates:[[26.85,81.08],[26.86,81.16],[26.81,81.205],[26.75,81.184],[26.73,81.12],[26.79,81.065]]},
{id:'WS-MP-BPL-009',name:'Berasia',district:'Bhopal',state:'Madhya Pradesh',area:2780,lat:23.63,lng:77.43,veg:44,water:6.7,interventions:43,coordinates:[[23.69,77.37],[23.7,77.45],[23.65,77.5],[23.59,77.48],[23.57,77.41],[23.62,77.36]]},
{id:'WS-RJ-JPR-031',name:'Jamwa Ramgarh',district:'Jaipur',state:'Rajasthan',area:3340,lat:27.02,lng:76.0,veg:32,water:4.3,interventions:76,coordinates:[[27.08,75.92],[27.1,76.02],[27.04,76.09],[26.98,76.08],[26.95,76.0],[27.01,75.92]]},
{id:'WS-MH-PUN-006',name:'Velhe',district:'Pune',state:'Maharashtra',area:1920,lat:18.28,lng:73.62,veg:57,water:9.1,interventions:48,coordinates:[[18.34,73.56],[18.36,73.64],[18.3,73.69],[18.24,73.67],[18.22,73.59],[18.28,73.54]]},
{id:'WS-KA-MYS-014',name:'Hunsur',district:'Mysuru',state:'Karnataka',area:2260,lat:12.31,lng:76.29,veg:51,water:6.8,interventions:55,coordinates:[[12.37,76.23],[12.38,76.33],[12.33,76.38],[12.27,76.35],[12.25,76.27],[12.31,76.21]]},
{id:'WS-TS-HYD-021',name:'Shamirpet',district:'Medchal',state:'Telangana',area:1680,lat:17.59,lng:78.57,veg:39,water:7.8,interventions:34,coordinates:[[17.65,78.51],[17.66,78.6],[17.61,78.65],[17.55,78.62],[17.53,78.54],[17.59,78.49]]},
{id:'WS-OD-KHD-003',name:'Khordha',district:'Khordha',state:'Odisha',area:2510,lat:20.18,lng:85.62,veg:46,water:10.2,interventions:63,coordinates:[[20.24,85.55],[20.25,85.64],[20.2,85.69],[20.14,85.67],[20.12,85.59],[20.18,85.53]]},
{id:'WS-GJ-AHM-017',name:'Dholka',district:'Ahmedabad',state:'Gujarat',area:2940,lat:22.75,lng:72.44,veg:34,water:5.9,interventions:41,coordinates:[[22.81,72.37],[22.82,72.46],[22.77,72.51],[22.71,72.49],[22.69,72.41],[22.75,72.35]]}
];
export const images=Array.from({length:30},(_,i)=>{const w=watersheds[i%watersheds.length];return{id:`IMG-${String(102+i).padStart(3,'0')}`,watershedId:w.id,title:['Check Dam','Farm Pond','Plantation','Contour Trench','Water Harvesting Structure'][i%5],category:['Check Dam','Farm Pond','Plantation','Soil Conservation','Water Harvesting'][i%5],lat:w.lat+((i%3)-1)*.018,lng:w.lng+((i%4)-1.5)*.02,date:`${String(3+(i*3%25)).padStart(2,'0')} ${['Mar','Apr','May','Jun','Jul'][Math.floor(i/6)]} 2026`,watershed:w.name,district:w.district,imageUrl:`https://images.unsplash.com/photo-${['1500382017468-9049fed747ef','1472396961693-142e6e269027','1511497584788-876760111969'][i%3]}?auto=format&fit=crop&w=700&q=80`}});
export const interventions=Array.from({length:40},(_,i)=>{const w=watersheds[i%10];return{id:`INT-${String(401+i)}`,type:['Check Dam','Farm Pond','Contour Trench','Plantation'][i%4],lat:w.lat+((i%5)-2)*.013,lng:w.lng+((i%7)-3)*.011,watershed:w.name,status:i%5===0?'Under construction':'Complete'}});

export type WatershedAnalysis = {
  landUse: { name: string; value: number }[];
  vegetationChange: number;
  waterChange: number;
  waterAreaHa: number;
  waterBodies: number;
  seasonalWaterBodies: number;
  drainage: { total: number; primary: number; secondary: number; density: number };
  interventions: { name: string; count: number }[];
  monthly: { m: string; vegetation: number; waterArea: number; waterIndex: number }[];
};

// Deterministic, watershed-specific prototype indicators derived from the
// watershed record so changing the selected basin changes every analysis view.
export function getWatershedAnalysis(w: Watershed): WatershedAnalysis {
  const index = Math.max(0, watersheds.findIndex((item) => item.id === w.id));
  const barren = 5 + ((index * 3 + 1) % 8);
  const builtUp = 3 + ((index * 2 + 1) % 6);
  const agriculture = Math.max(1, 100 - w.veg - w.water - barren - builtUp);
  const vegetationChange = Number((6.8 + ((index * 1.73) % 8.4)).toFixed(1));
  const waterChange = Number((8.5 + ((index * 2.37) % 14)).toFixed(1));
  const waterAreaHa = Math.round((w.area * w.water) / 100);
  const waterBodies = Math.max(5, Math.round(w.area / 280) + index * 3);
  const seasonalWaterBodies = Math.max(
    2,
    Math.round(waterBodies * (0.34 + (index % 4) * 0.055)),
  );
  const density = Number((0.2 + index * 0.035).toFixed(2));
  const totalDrainage = Number(((w.area / 100) * density).toFixed(1));
  const primary = Number((totalDrainage * (0.27 + (index % 4) * 0.035)).toFixed(1));
  const weights = [
    25 + ((index * 4) % 12),
    20 + ((index * 3) % 10),
    25 + ((index * 5) % 12),
  ];
  const interventionCounts = weights.map((weight) =>
    Math.round((w.interventions * weight) / 100),
  );
  interventionCounts.push(w.interventions - interventionCounts.reduce((a, b) => a + b, 0));
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  const startVegetation = Math.max(8, w.veg - vegetationChange);
  const startWaterRatio = Math.max(0.48, 1 - waterChange / 100);
  const monthly = months.map((m, month) => {
    const progress = month / (months.length - 1);
    return {
      m,
      vegetation: Number((startVegetation + (w.veg - startVegetation) * progress).toFixed(1)),
      waterArea: Math.round(waterAreaHa * (startWaterRatio + (1 - startWaterRatio) * progress)),
      waterIndex: Number((w.water * (startWaterRatio + (1 - startWaterRatio) * progress)).toFixed(1)),
    };
  });

  return {
    landUse: [
      { name: "Agriculture", value: agriculture },
      { name: "Vegetation", value: w.veg },
      { name: "Water", value: w.water },
      { name: "Barren land", value: barren },
      { name: "Built-up", value: builtUp },
    ],
    vegetationChange,
    waterChange,
    waterAreaHa,
    waterBodies,
    seasonalWaterBodies,
    drainage: {
      total: totalDrainage,
      primary,
      secondary: Number((totalDrainage - primary).toFixed(1)),
      density,
    },
    interventions: [
      { name: "Check dams", count: interventionCounts[0] },
      { name: "Farm ponds", count: interventionCounts[1] },
      { name: "Contour trenches", count: interventionCounts[2] },
      { name: "Plantation areas", count: interventionCounts[3] },
    ],
    monthly,
  };
}
