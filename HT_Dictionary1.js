class CPos {
    constructor (key, elem, next) {
        // inserts this new node between prev and next
        this._key = key;
        this._elem = elem;
        this._next = next;
    }
    key() {
        return this._key;
    }
    element() {
        return this._elem;
    }
}
class Chain {
    constructor() {
        this._header = new CPos(null, null, null);
        this._size = 0;
    }
    isLast(p) {
        return (p._next == null);
    }
    isOffEnd(p) {
        return p == null;
    }
    size() {
        return this._size;
    }
    isEmpty() {
        return this._size == 0;
    }
    first() {
        return this._header._next;
    }
    after(p) {
        return p._next;
    }
    replaceElement(p, elem) {
        let oldElem = p._elem;
        p._elem = elem;
        return oldElem;
    }
    insertAfter(p, newNode) {
        if (p == null) {
            p = this._header; // insert first
        }
        newNode._next = p._next; // bug 1 missing _next
        p._next = newNode;
        this._size++;
        return newNode;
    }
    _findPrevPos(key) { // returns internal object so must be private
        let p = this.first();
        let prev = this._header;
        while (!this.isOffEnd(p) && p.key() != key) {
            prev = p;
            p = this.after(p);
        }
        return prev;
    }
    insertInChain(key, elem) {
        let prev = this._findPrevPos(key);
        if (this.isLast(prev) || prev._next.key() != key) {
            let newNode = new CPos(key, elem, null);
            this.insertAfter(prev, newNode);
            return newNode;  // different types returned
        } else {
            return this.replaceElement(prev._next, elem);
        }
    }
    removeNext(prev) {
        let p = prev._next; // the node to be removed
        prev._next = p._next;
        p._next = null;// should no longer reference a Position in Chain
        this._size--;
        return p;
    }
    removeElem(key) {
        let prev = this._findPrevPos(key);
        if (this.isLast(prev) || prev._next.key() != key) {
            return null;
        } else {
            let e = prev._next.element();
            this.removeNext(prev);
            return e;
        }
    }
    findElem(key) {
        let prev = this._findPrevPos(key);
        if (this.isLast(prev) || prev._next.key() != key) {
            return null;
        } else {
            let e = prev._next.element();
            this.removeNext(prev);
            return e;
        }
    }
    toString() {
        let p = this.first();
        let str = "[";
        while (!this.isOffEnd(p)) {
            str = str + "(" + p.key() + "," + p.element() + ")";
            p = this.after(p);
        }
        return str + "]";
    }
}
class HT_Dictionary { // implemented as a linear hash table
    constructor () {
        this._table = [];
        this._size = 0;
        this._numChains = 3;
        for (let i=0; i< this._numChains; i++) {
            this._table[i] = new Chain();
        }
        this._numSplitChains = 0;
    }
    hashCode(k) {
        return k; // override or replace if needed (works if k is a positive integer)
    }
    _hashFunction(k) {
        let hc = this.hashCode(k);
        let ch = Math.floor(hc % this._numChains);
        if (ch < this._numSplitChains) {
            ch = Math.floor(hc % (2*this._numChains));
        }
        return ch;
    }
    findElement(k) {
        let chain = this._hashFunction(k);
        return this._table[chain].findElem(k);
    }
    _splitNextChain() {
        let chainToSplit = this._numSplitChains;
        let theChain = this._table[chainToSplit];
        this._numSplitChains++;
        let newChain = new Chain();
        this._table.push(newChain);
        if (this._numSplitChains == this._numChains) {
            this._numChains += this._numSplitChains;
            this._numSplitChains = 0;
        }
        // console.log("chain to split " + chainToSplit);
        if (theChain.size() > 0) {
            let prev = theChain._header;
            let curr = theChain.first();
            let prevNewItem = newChain._header;
            while (!theChain.isOffEnd(curr)) {
                let chain = this._hashFunction(curr.key());
                if (chain != chainToSplit) {
                    theChain.removeNext(prev); // removes curr
                    prevNewItem = newChain.insertAfter(prevNewItem, curr);
                } else {
                    prev = curr;
                }
                curr = theChain.after(prev);
            }       
        }
    }
    insertItem(k, e) {
        let oldElem = this.findElement(k);
        if (oldElem == null) {
            this._size++;
            let totalChains = this._numChains + this._numSplitChains;
            if ((this._size/totalChains) >= 0.75) { // load factor
                this._splitNextChain();
            }
        }
        let chain = this._hashFunction(k); // bug 2: missing
        return this._table[chain].insertInChain(k, e);
    }
    removeElement(k) {
        let chain = this._hashFunction(k);
        let oldElem = this._table[chain].findElem(k);
        if (oldElem != null) {
            this._size--;
            return this._table[chain].removeElem(k);
        }
    }
    print() {
        let totalChains = this._numChains + this._numSplitChains;
        console.log("chains=" + this._numChains + 
                        " splits=" + this._numSplitChains);
        console.log("{");
        for (let i=0; i<totalChains; i++) {
            console.log(this._table[i].toString());
        }
        console.log("}\n");
    }
}

// to get the winner of the election. I consider the index with maximum elements in it
// will be the winner. the id of the winner is the index of the array.

function getWinner(s) {
   let currentMax = 0;
   let winnerKey = "";
   let count = 1;
   let len = s._numChains + s._numSplitChains;
  // console.log(len);

   for(let i=0; i<len ; i++){
       let p = s._table[i].first();
       //console.log(p);
       while(p!=null){
           count++;
           //console.log(p);
           p=s._table[i].after(p);
       }
       if( currentMax < count ){
         currentMax = count;
         //console.log(currentMax);
         winnerKey = i;
         count = 1;
       }
       else {
           count = 1;
       }

   }
   return winnerKey;
}


let ht = new HT_Dictionary();
ht.print();
ht.insertItem(25,150);
ht.print();
ht.insertItem(35,350);
ht.insertItem(10,100);
ht.print();
ht.insertItem(11,110);
ht.insertItem(6,60);
ht.print();
ht.insertItem(26,260);
ht.print();
ht.insertItem(5,50);
ht.insertItem(3,30);
ht.insertItem(25,250);
ht.print();
ht.insertItem(22,220);
ht.insertItem(52, 520);
ht.print();
ht.removeElement(10);
ht.removeElement(22);
ht.removeElement(35);
ht.removeElement(19);
ht.print();

console.log(getWinner(ht));