function calculateCoreOptimization(input){
    let g = input.g||0, s=input.s||0, o=input.o||0, m=input.m||0, u=input.u||0;
    let eG_exist=input.eG_exist||0, eW_exist=input.eW_exist||0, eC_exist=input.eC_exist||0, eL_exist=input.eL_exist||0, eCo_exist=input.eCo_exist||0;
    let cWG_exist=input.cWG_exist||0, cWP_exist=input.cWP_exist||0, cOD_exist=input.cOD_exist||0, cVD_exist=input.cVD_exist||0, cED_exist=input.cED_exist||0;

    let tot_eG = eG_exist+g, tot_eW = eW_exist+s, tot_eC = eC_exist+o, tot_eL = eL_exist+m, tot_eCo = eCo_exist+u;

    let bestGold=-1, bestA=0, bestK=0, bestL=0;
    let core_upper = Math.max(10, Math.min(200, tot_eG+tot_eW+tot_eC+tot_eL+tot_eCo));

    for(let A=0;A<=core_upper;A++){
        for(let K=0;K<=core_upper;K++){
            for(let L=0;L<=core_upper;L++){
                let need_WG = A+L, need_WP=K+L, need_OD=A+K, need_VD=A+K, need_ED=L;
                let make_WG=Math.max(0,need_WG-cWG_exist);
                let make_WP=Math.max(0,need_WP-cWP_exist);
                let make_OD=Math.max(0,need_OD-cOD_exist);
                let make_VD=Math.max(0,need_VD-cVD_exist);
                let make_ED=Math.max(0,need_ED-cED_exist);

                let req_eG = make_WG+make_ED;
                let req_eW = make_WG+make_WP;
                let req_eC = make_WP+make_OD;
                let req_eL = make_OD+make_VD;
                let req_eCo = make_VD+make_ED;

                if(req_eG>tot_eG||req_eW>tot_eW||req_eC>tot_eC||req_eL>tot_eL||req_eCo>tot_eCo) continue;

                let gold = A*2403+K*2438+L*2512;
                if(gold>bestGold){ bestGold=gold; bestA=A; bestK=K; bestL=L; }
            }
        }
    }

    if(bestGold<0) return null;

    let used_WG=bestA+bestL, used_WP=bestK+bestL, used_OD=bestA+bestK, used_VD=bestA+bestK, used_ED=bestL;
    let needMake_WG=Math.max(0,used_WG-cWG_exist), needMake_WP=Math.max(0,used_WP-cWP_exist),
        needMake_OD=Math.max(0,used_OD-cOD_exist), needMake_VD=Math.max(0,used_VD-cVD_exist),
        needMake_ED=Math.max(0,used_ED-cED_exist);

    let make_eG=Math.max(0,needMake_WG+needMake_ED-eG_exist);
    let make_eW=Math.max(0,needMake_WG+needMake_WP-eW_exist);
    let make_eC=Math.max(0,needMake_WP+needMake_OD-eC_exist);
    let make_eL=Math.max(0,needMake_OD+needMake_VD-eL_exist);
    let make_eCo=Math.max(0,needMake_VD+needMake_ED-eCo_exist);

    let need_clay=make_eG*2, need_sand=make_eW*3, need_dirt=make_eC*4, need_gravel=make_eL*3, need_granite=make_eCo*1;
    let need_shrimp=needMake_WG, need_domi=needMake_WP, need_herring=needMake_OD, need_goldfish=needMake_VD, need_bass=needMake_ED;

    return {bestA,bestK,bestL,bestGold,make_eG,make_eW,make_eC,make_eL,make_eCo,
        needMake_WG,needMake_WP,needMake_OD,needMake_VD,needMake_ED,
        need_clay,need_sand,need_dirt,need_gravel,need_granite,
        need_shrimp,need_domi,need_herring,need_goldfish,need_bass};
}
