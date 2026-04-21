import { Component, inject, Input, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AvatarComponent } from '@components';
import { SessionHubClient } from '../../core/realtime/session-hub.client';
import { SessionStore } from '../../core/auth/session.store';
import { environment } from '../../../environments/environment';

export interface CommentAuthor {
  id: string;
  displayName: string;
  avatarUrl?: string;
}

export interface CommentDto {
  id: string;
  suggestionId: string;
  body: string;
  author: CommentAuthor;
  createdAt: string;
  editedAt?: string;
  deleted: boolean;
}

@Component({
  selector: 'app-comment-thread',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, AvatarComponent],
  template: `
    <div class="comment-thread" data-testid="comment-thread">
      @if (comments().length > 0) {
        <ul class="comment-list" data-testid="comment-list">
          @for (c of comments(); track c.id; let i = $index) {
            <li [attr.data-testid]="'comment-item-' + i" class="comment-item">
              @if (c.deleted) {
                <span class="deleted-placeholder" data-testid="comment-deleted-placeholder">Comment deleted</span>
              } @else {
                <div class="comment-header">
                  <qq-avatar [name]="c.author.displayName" size="sm" />
                  <span class="author-name">{{ c.author.displayName }}</span>
                  @if (c.editedAt) {
                    <span class="edited-badge" data-testid="edited-badge">edited</span>
                  }
                </div>
                @if (editingId() === c.id) {
                  <div class="edit-form">
                    <mat-form-field appearance="outline" class="edit-field">
                      <mat-label>Edit comment</mat-label>
                      <textarea matInput
                        [(ngModel)]="editBody"
                        maxlength="500"
                        rows="2"
                        [attr.data-testid]="'edit-input-' + i"
                        aria-label="Edit comment"></textarea>
                      <mat-hint align="end">{{ editBody.length }}/500</mat-hint>
                    </mat-form-field>
                    <div class="edit-actions">
                      <button mat-flat-button color="primary"
                        (click)="submitEdit(c.id)"
                        [attr.data-testid]="'save-edit-btn-' + i">Save</button>
                      <button mat-stroked-button (click)="cancelEdit()" data-testid="cancel-edit-btn">Cancel</button>
                    </div>
                  </div>
                } @else {
                  <p class="comment-body" [attr.data-testid]="'comment-body-' + i">{{ c.body }}</p>
                  @if (isOwn(c)) {
                    <div class="comment-actions">
                      <button mat-icon-button aria-label="Edit comment"
                        [attr.data-testid]="'edit-btn-' + i"
                        (click)="startEdit(c)">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button aria-label="Delete comment"
                        [attr.data-testid]="'delete-btn-' + i"
                        (click)="deleteComment(c.id)">
                        <mat-icon>delete_outline</mat-icon>
                      </button>
                    </div>
                  }
                }
              }
            </li>
          }
        </ul>
      } @else {
        <p class="empty" data-testid="no-comments">No comments yet.</p>
      }

      @if (!isSessionClosed()) {
        <div class="compose-area" data-testid="compose-area">
          <mat-form-field appearance="outline" class="compose-field">
            <mat-label>Add a comment</mat-label>
            <textarea matInput
              [(ngModel)]="newBody"
              maxlength="500"
              rows="2"
              data-testid="comment-input"
              aria-label="Add a comment"></textarea>
            <mat-hint align="end"
              [attr.aria-live]="newBody.length >= 450 ? 'polite' : null">
              {{ newBody.length }}/500</mat-hint>
          </mat-form-field>
          <button mat-flat-button color="primary"
            [disabled]="newBody.trim().length === 0"
            data-testid="post-comment-btn"
            (click)="submitComment()">
            Post
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .comment-thread { display: flex; flex-direction: column; gap: 8px; padding: 8px 0; }
    .comment-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
    .comment-item { padding: 6px 0; border-bottom: 1px solid var(--mat-sys-surface-variant); }
    .comment-item:last-child { border-bottom: none; }
    .comment-header { display: flex; align-items: center; gap: 6px; margin-bottom: 2px; }
    .author-name { font-weight: 500; font-size: 13px; }
    .edited-badge { font-size: 11px; color: var(--mat-sys-on-surface-variant); margin-left: 4px; }
    .comment-body { font-size: 14px; margin: 4px 0 2px 0; white-space: pre-wrap; }
    .comment-actions { display: flex; gap: 2px; }
    .deleted-placeholder { font-size: 13px; color: var(--mat-sys-on-surface-variant); font-style: italic; }
    .empty { font-size: 13px; color: var(--mat-sys-on-surface-variant); margin: 0; }
    .compose-area { display: flex; flex-direction: column; gap: 4px; margin-top: 4px; }
    .compose-field { width: 100%; }
    .edit-form { display: flex; flex-direction: column; gap: 4px; }
    .edit-field { width: 100%; }
    .edit-actions { display: flex; gap: 8px; }
  `],
})
export class CommentThreadComponent implements OnInit, OnDestroy {
  @Input({ required: true }) sessionId!: string;
  @Input({ required: true }) suggestionId!: string;
  @Input() sessionState = '';

  private readonly http = inject(HttpClient);
  private readonly hub = inject(SessionHubClient);
  private readonly sessionStore = inject(SessionStore);

  readonly comments = signal<CommentDto[]>([]);
  readonly editingId = signal<string | null>(null);
  newBody = '';
  editBody = '';

  readonly isSessionClosed = computed(() =>
    this.sessionState === 'Decided' || this.sessionState === 'Cancelled'
  );

  isOwn(c: CommentDto): boolean {
    return c.author.id === this.sessionStore.user()?.id;
  }

  startEdit(c: CommentDto): void {
    this.editingId.set(c.id);
    this.editBody = c.body;
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.editBody = '';
  }

  submitComment(): void {
    const body = this.newBody.trim();
    if (!body) return;
    this.newBody = '';
    this.http
      .post<CommentDto>(
        `${environment.apiBaseUrl}/sessions/${this.sessionId}/suggestions/${this.suggestionId}/comments`,
        { body }
      )
      .subscribe({ error: () => { this.newBody = body; } });
  }

  submitEdit(commentId: string): void {
    const body = this.editBody.trim();
    if (!body) return;
    this.editBody = '';
    this.editingId.set(null);
    this.http
      .put<CommentDto>(`${environment.apiBaseUrl}/comments/${commentId}`, { body })
      .subscribe({
        next: dto => {
          this.comments.update(list => list.map(c => c.id === dto.id ? dto : c));
        },
        error: () => {
          this.editBody = body;
          this.editingId.set(commentId);
        },
      });
  }

  deleteComment(commentId: string): void {
    this.http
      .delete(`${environment.apiBaseUrl}/comments/${commentId}`)
      .subscribe({
        next: () => {
          this.comments.update(list =>
            list.map(c => c.id === commentId ? { ...c, deleted: true, body: '' } : c)
          );
        },
        error: () => {},
      });
  }

  ngOnInit(): void {
    this.loadComments();
    this.hub.on<CommentDto>('CommentAdded', dto => {
      if (dto.suggestionId !== this.suggestionId) return;
      this.comments.update(list => [...list, dto]);
    });
    this.hub.on<CommentDto>('CommentEdited', dto => {
      if (dto.suggestionId !== this.suggestionId) return;
      this.comments.update(list => list.map(c => c.id === dto.id ? dto : c));
    });
    this.hub.on<{ commentId: string; suggestionId: string }>('CommentDeleted', payload => {
      if (payload.suggestionId !== this.suggestionId) return;
      this.comments.update(list =>
        list.map(c => c.id === payload.commentId ? { ...c, deleted: true, body: '' } : c)
      );
    });
  }

  private loadComments(): void {
    this.http
      .get<CommentDto[]>(`${environment.apiBaseUrl}/sessions/${this.sessionId}/comments`)
      .subscribe({
        next: all => {
          this.comments.set(all.filter(c => c.suggestionId === this.suggestionId));
        },
        error: () => {},
      });
  }

  ngOnDestroy(): void {
    this.hub.off('CommentAdded');
    this.hub.off('CommentEdited');
    this.hub.off('CommentDeleted');
  }
}
