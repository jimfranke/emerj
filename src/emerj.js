const emerj = {
    attrs(elem) {
        const attrs = {};
        for (let i=0; i < elem.attributes.length; i++) {
            const attr = elem.attributes[i];
            attrs[attr.name] = attr.value;
        }
        return attrs;
    },
    nodesByKey(parent, makeKey) {
        const map = {};
        for (let j=0; j < parent.childNodes.length; j++) {
            const key = makeKey(parent.childNodes[j]);
            if (key) map[key] = parent.childNodes[j];
        }
        return map;
    },
    merge(base, modified, opts) {
        opts = opts || {};
        opts.key = opts.key || (node => node.id);
        if (typeof modified === 'string') {
            const html = modified;
            modified = document.createElement(base.tagName);
            modified.innerHTML = html;
        }
        const nodesByKey = {old: this.nodesByKey(base, opts.key),
            new: this.nodesByKey(modified, opts.key)};
        let idx;
        for (idx=0; modified.firstChild; idx++) {
            const newNode = modified.removeChild(modified.firstChild);
            if (idx >= base.childNodes.length) {
                base.appendChild(newNode);
                continue;
            }
            let baseNode = base.childNodes[idx];
            const newKey = opts.key(newNode);
            if (opts.key(baseNode) || newKey) {
                const match = (newKey && newKey in nodesByKey.old)? nodesByKey.old[newKey]: newNode;
                if (match !== baseNode) {
                    baseNode = base.insertBefore(match, baseNode);
                }
            }
            if (baseNode.nodeType !== newNode.nodeType || baseNode.tagName !== newNode.tagName) {
                base.replaceChild(newNode, baseNode);
            } else if ([Node.TEXT_NODE, Node.COMMENT_NODE].indexOf(baseNode.nodeType) >= 0) {
                if (baseNode.textContent === newNode.textContent) continue;
                baseNode.textContent = newNode.textContent;
            } else if (baseNode !== newNode) {
                const attrs = {base: this.attrs(baseNode), new: this.attrs(newNode)};
                for (const attr in attrs.base) {
                    if (attr in attrs.new) continue;
                    baseNode.removeAttribute(attr);
                }
                for (const attr in attrs.new) {
                    if (attr in attrs.base && attrs.base[attr] === attrs.new[attr]) continue;
                    baseNode.setAttribute(attr, attrs.new[attr]);
                }
                this.merge(baseNode, newNode);
            }
        }
        while (base.childNodes.length > idx) {
            base.removeChild(base.lastChild);
        }
    },
};

export default emerj;
