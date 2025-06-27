    function generateTree() {
      const input = document.getElementById('input').value.trim();
      if (!input) return alert('請先輸入檔案路徑！');

      const lines = input.split('\n').map(l => l.trim()).filter(Boolean);

      const parsed = lines.map(line => {
        const match = line.match(/^(.*?)(?:\s+(\/\/|#)\s*(.*))?$/);
        const path = match[1].replace(/^\.\/?/, '').trim();
        const comment = match[2] ? match[2] + ' ' + match[3] : '';
        return { path, comment };
      });

      const root = parsed[0].path;
      const entries = parsed.slice(1);
      const tree = buildTree(entries);
      const flat = [];

      flat.push({ text: root + (root.endsWith('/') ? '' : '/'), comment: '' });
      gatherTree(tree, '  ', flat);

      const maxLen = flat.reduce((max, line) => Math.max(max, line.text.length), 0);
      const result = flat.map(line => line.text + (line.comment ? ' '.repeat(maxLen - line.text.length + 1) + line.comment : '')).join('\n');
      document.getElementById('output').value = result;
    }

    function buildTree(entries) {
      const tree = {};
      entries.forEach(({ path, comment }) => {
        const raw = path.split('/');
        const parts = raw.filter((_, i) => i < raw.length - 1 || !path.endsWith('/'));
        let current = tree;
        for (let i = 0; i < parts.length; i++) {
          const isLast = i === parts.length - 1;
          const isFolder = path.endsWith('/') && isLast;
          const name = parts[i] + (isFolder ? '/' : '');
          if (!current[name]) current[name] = { __children: {}, __comment: '' };
          if (isLast) current[name].__comment = comment;
          current = current[name].__children;
        }
      });
      return tree;
    }

    function gatherTree(tree, indent, out) {
      const keys = Object.keys(tree);
      keys.forEach((key, i) => {
        const isLast = i === keys.length - 1;
        const prefix = indent + (isLast ? '└── ' : '├── ');
        const node = tree[key];
        out.push({ text: prefix + key, comment: node.__comment });
        if (Object.keys(node.__children).length > 0) {
          const nextIndent = indent + (isLast ? '    ' : '│   ');
          gatherTree(node.__children, nextIndent, out);
        }
      });
    }

    function clearInput() {
      document.getElementById('input').value = '';
    }

    function clearOutput() {
      document.getElementById('output').value = '';
    }

    function copyToClipboard() {
      const output = document.getElementById('output');
      if (!output.value.trim()) return alert('沒有內容可以複製！');
      navigator.clipboard.writeText(output.value).then(showSuccessMessage);
    }

    function showSuccessMessage() {
      const msg = document.getElementById('successMessage');
      msg.classList.add('show');
      setTimeout(() => msg.classList.remove('show'), 2000);
    }

    window.onload = () => {
      document.getElementById('input').focus();
    };
