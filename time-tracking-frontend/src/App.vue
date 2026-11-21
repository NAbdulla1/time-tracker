<template>
  <div class="app-layout">
    <!-- Collapsible Left Navigation Drawer (250px) -->
    <aside :class="['sidebar-drawer', { collapsed: store.isSidebarCollapsed }]">
      <div class="drawer-header">
        <h3 class="drawer-title">⏱️ Time Tracker</h3>
        <button class="icon-toggle-btn collapse-btn" @click="store.toggleSidebar" title="Collapse sidebar">
          ◀
        </button>
      </div>

      <nav class="drawer-nav">
        <router-link to="/" class="nav-link" active-class="active" exact>
          <span class="nav-icon">⏱️</span>
          <span class="nav-text">Tracker</span>
        </router-link>
        <router-link to="/settings" class="nav-link" active-class="active">
          <span class="nav-icon">⚙️</span>
          <span class="nav-text">Preferences</span>
        </router-link>
      </nav>

      <div class="drawer-footer">
        <div class="tz-label">Client Timezone</div>
        <div class="tz-value" :title="activeTimeZone">
          <span class="tz-icon">🌐</span>
          <span class="tz-text">{{ activeTimeZone }}</span>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="main-wrapper">
      <!-- Floating Icon Button when Drawer is Collapsed -->
      <button
        v-if="store.isSidebarCollapsed"
        class="icon-toggle-btn expand-btn"
        @click="store.toggleSidebar"
        title="Open navigation drawer"
      >
        ☰
      </button>

      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useStore } from './store';

const store = useStore();

const activeTimeZone = computed(() => {
  return (
    store.settings?.timeZone ||
    localStorage.getItem('user_timezone') ||
    (typeof Intl !== 'undefined' && Intl.DateTimeFormat().resolvedOptions().timeZone) ||
    'UTC'
  );
});

onMounted(async () => {
  await store.fetchSettings();
});
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  width: 100vw;
  box-sizing: border-box;
}

/* Sidebar Drawer - 250px Fixed Width */
.sidebar-drawer {
  width: 250px;
  min-width: 250px;
  max-width: 250px;
  background-color: var(--drawer-bg, #1a1a1a);
  border-right: 1px solid var(--border-color, #333);
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
  overflow: hidden;
  z-index: 100;
}

.sidebar-drawer.collapsed {
  width: 0;
  min-width: 0;
  max-width: 0;
  border-right-width: 0;
  opacity: 0;
  pointer-events: none;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 16px;
  border-bottom: 1px solid var(--border-color, #2a2a2a);
}

.drawer-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
  white-space: nowrap;
  color: var(--text-heading, inherit);
}

.drawer-nav {
  display: flex;
  flex-direction: column;
  padding: 16px 8px;
  gap: 6px;
  flex: 1;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  color: var(--nav-text-color, #bbb);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
  white-space: nowrap;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.08);
  color: var(--text-heading, #fff);
}

.nav-link.active {
  background-color: rgba(100, 108, 255, 0.18);
  color: #8b92ff;
}

.nav-icon {
  font-size: 1.2rem;
}

.drawer-footer {
  padding: 16px;
  border-top: 1px solid var(--border-color, #2a2a2a);
  background: var(--drawer-footer-bg, rgba(0, 0, 0, 0.15));
  font-size: 0.85rem;
  text-align: left;
}

.tz-label {
  color: var(--text-muted, #888);
  margin-bottom: 6px;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.tz-value {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--tz-text-color, #f1f5f9);
  font-weight: 500;
  min-width: 0;
}

.tz-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.tz-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.9rem;
}

/* Toggle Buttons */
.icon-toggle-btn {
  background: transparent;
  border: 1px solid var(--border-color, #444);
  color: var(--text-heading, #ccc);
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  font-size: 1rem;
  transition: all 0.2s;
}

.icon-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border-color: #646cff;
}

.expand-btn {
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 99;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  background: var(--drawer-bg, #1a1a1a);
  width: 36px;
  height: 36px;
  font-size: 1.15rem;
}

/* Main Content Area */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  min-width: 0;
}

.main-content {
  flex: 1;
  padding: 2rem;
  box-sizing: border-box;
  overflow-y: auto;
}
</style>
