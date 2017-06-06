/**
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only. Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */



class SuperTableStore {
    constructor(/*number*/ data) {
        this.size = data.length;
        this._cache = [];
        this.data = data;
    }

    /**
     * Get from our data store...
     * @param {*} index 
     */
    getFromData(index) {

        return this.data[ index ];


    }

    getObjectAt(/*number*/ index) /*?object*/ {

        if (index < 0 || index > this.size) {
            return undefined;
        }
        if (this._cache[index] === undefined) {
            this._cache[index] = this.getFromData(index);
        }
        return this._cache[index];
    }

    /**
    * Populates the entire cache with data.
    * Use with Caution! Behaves slowly for large sizes
    * ex. 100,000 rows
    */
    getAll() {
        if (this._cache.length < this.size) {
            for (var i = 0; i < this.size; i++) {
                this.getObjectAt(i);
            }
        }
        return this._cache.slice();
    }

    getSize() {
        return this.size;
    }
}

module.exports = SuperTableStore;
