export function AutoUnsub() {
    return (constructor) => {
        const orig = constructor.prototype.ngOnDestroy;
        constructor.prototype.ngOnDestroy = () => {
            for(const prop in this) {
                const property = this[prop];
                if(typeof property.subscrbe === 'function') {
                    property.unsubscribe();
                }
            }
            if(orig) {
                orig.apply();
            }
        }
    }
}