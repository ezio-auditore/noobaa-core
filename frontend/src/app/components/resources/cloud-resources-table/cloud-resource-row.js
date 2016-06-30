import ko from 'knockout';
import { deepFreeze, formatSize } from 'utils';
import { deletePool } from 'actions';

const undeletableReasons = Object.freeze({
    IN_USE: 'Cannot delete a resource which is used in a bucket backup policy'
});

const icons = deepFreeze([
    {
        pattern: 's3.amazonaws.com',
        icon: 'amazon-resource'
    },
    {
        pattern: 'storage.googleapis.com',
        icon: 'google-resource'
    },
    {
        pattern: '',
        icon: 'cloud-resource'
    }
]);

export default class CloudResourceRowViewModel {
    constructor(resource, deleteGroup) {
        this.type = ko.pureComputed(
            () => {
                if (!resource) {
                    return;
                }

                let endpoint = resource.cloud_info.endpoint.toLowerCase();
                let { icon } = icons.find(
                    ({ pattern }) => endpoint.indexOf(pattern) > -1
                );

                return icon;
            }
        );

        this.name = ko.pureComputed(
            () => resource && resource.name
        );

        this.usage = ko.pureComputed(
            () => resource && formatSize(resource.storage.used)
        );

        this.cloudBucket = ko.pureComputed(
            () => resource && resource.cloud_info.target_bucket
        );

        this.delete = ko.pureComputed(
            () => {
                let undeletable = resource && resource.undeletable;
                let deleteToolTip = undeletable ?
                    undeletableReasons[undeletable] :
                    'delete resources';

                return {
                    deleteGroup: deleteGroup,
                    undeletable: Boolean(undeletable),
                    deleteToolTip: deleteToolTip,
                    onDelete: () => this.del()
                };
            }
        );
    }

    del() {
        deletePool(this.name());
    }
}
