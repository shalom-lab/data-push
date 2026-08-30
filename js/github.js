const github = {
  async request(path, options = {}) {
    const token = store.token;
    if (!token) throw new Error('NO_TOKEN');

    const headers = {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers
    };

    const res = await fetch(`https://api.github.com${path}`, {
      ...options,
      headers
    });

    if (res.status === 401) throw new Error('UNAUTHORIZED');
    if (res.status === 403) {
      const data = await res.json().catch(() => ({}));
      if (String(data.message || '').includes('Resource not accessible')) {
        throw new Error('ACCESS_DENIED');
      }
      throw new Error(data.message || 'FORBIDDEN');
    }
    if (res.status === 404) {
      const err = new Error('NOT_FOUND');
      err.status = 404;
      throw err;
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || `HTTP ${res.status}`);
    }
    if (res.status === 204) return null;
    return res.json();
  },

  async getUser() {
    return this.request('/user');
  },

  async listRepos() {
    const all = [];
    let page = 1;
    while (page <= 20) {
      const batch = await this.request(
        `/user/repos?per_page=100&page=${page}&affiliation=owner,collaborator,organization_member&sort=updated`
      );
      all.push(...batch);
      if (batch.length < 100) break;
      page += 1;
    }
    return all.sort((a, b) => a.full_name.localeCompare(b.full_name));
  },

  async getRepo(fullName) {
    return this.request(`/repos/${fullName}`);
  },

  async listBranches(fullName) {
    const branches = await this.request(`/repos/${fullName}/branches?per_page=100`);
    return branches.map((b) => b.name);
  },

  async getFile(fullName, filename, ref) {
    const q = ref ? `?ref=${encodeURIComponent(ref)}` : '';
    try {
      return await this.request(
        `/repos/${fullName}/contents/${filename.split('/').map(encodeURIComponent).join('/')}${q}`
      );
    } catch (err) {
      if (err.message === 'NOT_FOUND' || err.status === 404) return null;
      throw err;
    }
  },

  decodeContent(fileData) {
    if (!fileData || !fileData.content) return '';
    const b64 = fileData.content.replace(/\n/g, '');
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    return new TextDecoder('utf-8').decode(bytes);
  },

  encodeContent(text) {
    const bytes = new TextEncoder().encode(text);
    const chunk = 0x8000;
    let binary = '';
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
  },

  async putFile(fullName, filename, text, message, branch) {
    const file = await this.getFile(fullName, filename, branch);
    const body = {
      message: message || 'Update file via Data Push',
      content: this.encodeContent(text),
      sha: file?.sha
    };
    if (branch) body.branch = branch;
    return this.request(
      `/repos/${fullName}/contents/${filename.split('/').map(encodeURIComponent).join('/')}`,
      { method: 'PUT', body: JSON.stringify(body) }
    );
  },

  async appendJson(fullName, filename, entry, message, branch) {
    const file = await this.getFile(fullName, filename, branch);
    let existing = [];
    if (file) {
      try {
        const parsed = JSON.parse(this.decodeContent(file));
        existing = Array.isArray(parsed) ? parsed : [];
      } catch {
        existing = [];
      }
    }

    existing.push(entry);
    const json = JSON.stringify(existing, null, 2);
    const body = {
      message: message || 'Add new entry via Data Push',
      content: this.encodeContent(json),
      sha: file?.sha
    };
    if (branch) body.branch = branch;

    const result = await this.request(
      `/repos/${fullName}/contents/${filename.split('/').map(encodeURIComponent).join('/')}`,
      { method: 'PUT', body: JSON.stringify(body) }
    );

    return {
      result,
      count: existing.length,
      htmlUrl: result?.content?.html_url || file?.html_url || ''
    };
  }
};
