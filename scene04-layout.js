globalThis.SquishyScene04Layout={"home": {"landscape": [16, 8, 96, 96], "portrait": [16, 8, 96, 96]}, "pause": {"landscape": [912, 8, 96, 96], "portrait": [656, 8, 96, 96]}, "back": {"landscape": [16, 656, 96, 96], "portrait": [16, 912, 96, 96]}, "next": {"landscape": [912, 656, 96, 96], "portrait": [656, 912, 96, 96]}, "bowl": {"landscape": [260, 210, 504, 316], "portrait": [100, 264, 568, 328]}, "paddle": {"landscape": [648, 132, 136, 296], "portrait": [536, 168, 120, 328]}, "slot-a": {"landscape": [168, 128, 96, 96], "portrait": [40, 136, 96, 96]}, "slot-b": {"landscape": [168, 240, 96, 96], "portrait": [40, 248, 96, 96]}, "clear-b": {"landscape": [168, 352, 96, 96], "portrait": [40, 360, 96, 96]}, "auto": {"landscape": [808, 164, 96, 96], "portrait": [656, 136, 96, 96]}, "blend": {"landscape": [808, 276, 96, 96], "portrait": [656, 248, 96, 96]}, "undo": {"landscape": [808, 388, 96, 96], "portrait": [656, 360, 96, 96]}, "colour-1": {"landscape": [128, 552, 112, 96], "portrait": [40, 672, 208, 96]}, "colour-2": {"landscape": [256, 552, 112, 96], "portrait": [280, 672, 208, 96]}, "colour-3": {"landscape": [384, 552, 112, 96], "portrait": [520, 672, 208, 96]}, "colour-4": {"landscape": [512, 552, 112, 96], "portrait": [40, 792, 208, 96]}, "colour-5": {"landscape": [640, 552, 112, 96], "portrait": [280, 792, 208, 96]}, "colour-6": {"landscape": [768, 552, 112, 96], "portrait": [520, 792, 208, 96]}, "help": {"landscape": [800, 8, 96, 96], "portrait": [544, 8, 96, 96]}};
SquishyScene04Layout.front=structuredClone(SquishyScene04Layout.bowl);
// User-approved four-colour layout replaces the original two-slot placement.
Object.assign(SquishyScene04Layout,{
 'slot-a':{landscape:[272,112,96,96],portrait:[152,128,96,96]},
 'slot-b':{landscape:[384,112,96,96],portrait:[264,128,96,96]},
 'slot-c':{landscape:[496,112,96,96],portrait:[376,128,96,96]},
 'slot-d':{landscape:[608,112,96,96],portrait:[488,128,96,96]},
 'clear-b':{landscape:[160,112,96,96],portrait:[40,136,96,96]}
});

SquishyScene04Layout.bowl.landscape=[260,210,504,280];SquishyScene04Layout.front=structuredClone(SquishyScene04Layout.bowl);

// Reference-led larger bowl, with dedicated space for finish controls and colour wells.
Object.assign(SquishyScene04Layout,{
 bowl:{landscape:[154,208,652,352],portrait:[88,260,592,352]},
 auto:{landscape:[820,216,96,96],portrait:[656,136,96,96]},
 blend:{landscape:[820,328,96,96],portrait:[656,248,96,96]},
 undo:{landscape:[820,440,96,96],portrait:[656,360,96,96]}
});
for(let i=1;i<=6;i++){SquishyScene04Layout['colour-'+i].landscape=[128+(i-1)*128,624,112,88];SquishyScene04Layout['colour-'+i].portrait=[40+((i-1)%3)*240,i<=3?696:808,208,96]}
SquishyScene04Layout.front=structuredClone(SquishyScene04Layout.bowl);
