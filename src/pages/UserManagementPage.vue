<template>
  <q-page padding>
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="text-h5 text-primary q-mb-sm">User Management</div>
        <div class="text-subtitle2 text-grey-6">Add, edit, and remove users</div>
      </div>
      <div class="col-auto">
        <q-btn color="primary" icon="person_add" label="Add User" @click="openCreate" unelevated />
      </div>
    </div>

    <q-card>
      <q-card-section>
        <q-table
          flat
          :rows="users"
          :columns="columns"
          row-key="id"
          :filter="search"
          :pagination="{ rowsPerPage: 10 }"
        >
          <template #top>
            <div class="row items-center full-width q-gutter-sm">
              <div class="col-12 col-sm-4">
                <q-input v-model="search" dense filled placeholder="Search users by name or email">
                  <template #prepend>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </div>
            </div>
          </template>

          <template #body-cell-name="props">
            <q-td :props="props">
              <div class="row items-center no-wrap q-gutter-sm">
                <q-avatar :color="getUserColor(props.row.id)" text-color="white" size="32px">
                  <span class="text-weight-bold">{{ props.row.initials }}</span>
                </q-avatar>
                <div>
                  <div class="text-weight-medium">{{ props.row.name }}</div>
                  <div class="text-caption text-grey-7">{{ props.row.email }}</div>
                </div>
              </div>
            </q-td>
          </template>

          <template #body-cell-actions="props">
            <q-td :props="props">
              <q-btn dense flat round icon="edit" color="primary" @click="openEdit(props.row)" />
              <q-btn
                dense
                flat
                round
                icon="delete"
                color="negative"
                @click="confirmDelete(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Create / Edit Dialog -->
    <q-dialog v-model="showDialog">
      <q-card style="min-width: 420px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">{{ editing ? 'Edit User' : 'Add User' }}</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-form @submit.prevent="saveUser" class="q-gutter-md">
            <q-input
              v-model="form.name"
              label="Name"
              filled
              :rules="[(val) => !!val || 'Name is required']"
            />
            <q-input
              v-model="form.email"
              label="Email"
              type="email"
              filled
              :rules="[(val) => !!val || 'Email is required']"
            />
            <q-select
              v-model="form.role"
              :options="roleOptions"
              label="Role"
              filled
              emit-value
              map-options
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey-8" v-close-popup />
          <q-btn unelevated color="primary" label="Save" @click="saveUser" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete Confirm Dialog -->
    <q-dialog v-model="showDeleteConfirm">
      <q-card>
        <q-card-section class="row items-center q-gutter-sm">
          <q-icon name="warning" color="negative" size="md" />
          <div class="text-subtitle1">Delete this user?</div>
        </q-card-section>
        <q-card-section>
          <div>"{{ pendingDelete?.name }}" will be removed. This action cannot be undone.</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey-8" v-close-popup />
          <q-btn unelevated label="Delete" color="negative" @click="deleteUserConfirmed" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar, type QTableColumn } from 'quasar';
import { UserService } from '../services/UserService';
import { UserModel, type UserModelParams } from '../models/UserModel';

const $q = useQuasar();
const service = UserService.getInstance();

const users = ref<UserModel[]>([...service.getAllUsers()]);
const search = ref('');

const columns: QTableColumn<UserModel>[] = [
  { name: 'name', label: 'User', field: 'name', align: 'left', sortable: true },
  { name: 'role', label: 'Role', field: 'role', align: 'left', sortable: true },
  { name: 'actions', label: 'Actions', field: (row) => row.id, align: 'right', sortable: false },
];

const roleOptions = [
  { label: 'Member', value: 'member' },
  { label: 'Manager', value: 'manager' },
  { label: 'Software Engineer', value: 'Software Engineer' },
  { label: 'Designer', value: 'Designer' },
  { label: 'QA', value: 'QA' },
];

const showDialog = ref(false);
const editing = ref(false);
const form = ref<UserModelParams>({ name: '', email: '', role: 'member', avatar: null });

const showDeleteConfirm = ref(false);
const pendingDelete = ref<UserModel | null>(null);

const openCreate = () => {
  editing.value = false;
  form.value = { name: '', email: '', role: 'member', avatar: null };
  showDialog.value = true;
};

const openEdit = (user: UserModel) => {
  editing.value = true;
  form.value = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
  };
  showDialog.value = true;
};

const refresh = () => {
  users.value = [...service.getAllUsers()];
};

const saveUser = () => {
  try {
    if (editing.value && form.value.id) {
      service.update(new UserModel(form.value));
      $q.notify({ type: 'positive', message: 'User updated', position: 'top' });
    } else {
      service.create(new UserModel(form.value));
      $q.notify({ type: 'positive', message: 'User added', position: 'top' });
    }
    refresh();
    showDialog.value = false;
  } catch (e) {
    console.error(e);
    $q.notify({ type: 'negative', message: 'Failed to save user', position: 'top' });
  }
};

const confirmDelete = (user: UserModel) => {
  pendingDelete.value = user;
  showDeleteConfirm.value = true;
};

const deleteUserConfirmed = () => {
  if (!pendingDelete.value) return;
  try {
    service.delete(pendingDelete.value.id);
    refresh();
    $q.notify({ type: 'positive', message: 'User deleted', position: 'top' });
  } catch (e) {
    console.error(e);
    $q.notify({ type: 'negative', message: 'Failed to delete user', position: 'top' });
  } finally {
    pendingDelete.value = null;
    showDeleteConfirm.value = false;
  }
};

const getUserColor = (userId: string) => {
  const colors = ['primary', 'secondary', 'accent', 'positive', 'negative', 'info', 'warning'];
  const index = userId.charCodeAt(userId.length - 1) % colors.length;
  return colors[index];
};
</script>

<style scoped></style>
