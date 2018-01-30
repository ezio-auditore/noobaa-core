/* Copyright (C) 2016 NooBaa */

import { keyByProperty, groupBy, compare } from 'utils/core-utils';
import { createReducer } from 'utils/reducer-utils';
import { mapApiStorage } from 'utils/state-utils';
import { COMPLETE_FETCH_SYSTEM_INFO } from 'action-types';

// ------------------------------
// Initial State
// ------------------------------
const initialState = undefined;

// ------------------------------
// Action Handlers
// ------------------------------
function onCompleteFetchSystemInfo(state, { payload }) {
    const dataBuckets = payload.buckets
        .filter(bucket => bucket.bucket_type === 'REGULAR');

    const tiers = keyByProperty(payload.tiers, 'name');
    const resTypeByName = keyByProperty(payload.pools, 'name', res => res.resource_type);

    return keyByProperty(
        dataBuckets,
        'name',
        bucket => _mapBucket(bucket, tiers, resTypeByName)
    );
}

// ------------------------------
// Local util functions
// ------------------------------
function _mapBucket(bucket, tiersByName, resTypeByName) {
    const enabledTiers = bucket.tiering.tiers
        .filter(record => !record.disabled);

    const resUsageByName = keyByProperty(
        bucket.usage_by_pool.pools,
        'pool_name',
        record => record.storage.blocks_size
    );

    const { placementTiers = [], spilloverTiers = [] } = groupBy(
        enabledTiers,
        record => record.spillover ? 'spilloverTiers' : 'placementTiers',
        record => tiersByName[record.tier]
    );

    const { storage, data, quota, cloud_sync, stats } = bucket;
    return {
        name: bucket.name,
        tierName: placementTiers[0].name,
        mode: bucket.mode,
        storage: mapApiStorage(storage.values, storage.last_update),
        data: _mapData(data),
        quota: quota && {
            size: quota.size,
            unit: quota.unit
        },
        objectCount: bucket.num_objects,
        resiliencyDriveCountMetric: bucket.num_of_nodes,
        cloudSync: cloud_sync && {
            state: cloud_sync.status
        },
        undeletable: bucket.undeletable,
        placement: _mapPlacement(placementTiers[0], resTypeByName, resUsageByName),
        resiliency: _mapResiliency(placementTiers[0]),
        spillover: _mapSpillover(spilloverTiers[0], resTypeByName, resUsageByName),
        io: _mapIO(stats)
    };
}

function _mapData(data){
    return {
        lastUpdate: data.last_update,
        size: data.size,
        sizeReduced: data.size_reduced,
        availableForUpload: data.free,
        availableForSpillover: data.spillover_free
    };
}

function _mapPlacement(tier, typeByName, usageByName) {
    const { data_placement: policyType, mirror_groups } = tier;
    const mirrorSets = mirror_groups
        .sort((group1, group2) => compare(group1.name, group2.name))
        .map(group => {
            const { name, pools } = group;
            const resources = pools
                .map(name => {
                    const type = typeByName[name];
                    const usage = usageByName[name] || 0;
                    return { type, name, usage };
                });

            return { name, resources };
        });

    return { policyType, mirrorSets };
}

function _mapResiliency(tier) {
    const { data_frags, parity_frags, replicas } = tier.chunk_coder_config;

    if (parity_frags) {
        return {
            kind: 'ERASURE_CODING',
            dataFrags: data_frags,
            parityFrags: parity_frags
        };
    } else {
        return {
            kind: 'REPLICATION',
            replicas: replicas
        };
    }
}

function _mapSpillover(tier, typeByName, usageByName) {
    if (!tier) return;
    const { name: mirrorSet, pools } = tier.mirror_groups[0];
    const [name] = pools;
    const type = typeByName[name];
    const usage = usageByName[name] || 0;
    return { type, name, mirrorSet, usage };
}

function _mapIO(stats = {}) {
    const { reads = 0, writes = 0, last_read = -1, last_write = -1 } = stats;
    return {
        readCount: reads ,
        lastRead: last_read,
        writeCount: writes,
        lastWrite: last_write
    };

}

// ------------------------------
// Exported reducer function
// ------------------------------
export default createReducer(initialState, {
    [COMPLETE_FETCH_SYSTEM_INFO]: onCompleteFetchSystemInfo
});
