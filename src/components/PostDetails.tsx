import React, { useEffect, useState } from 'react';
import { Loader } from './Loader';
import { NewCommentForm } from './NewCommentForm';
import { Post } from '../types/Post';
import { Comment } from '../types/Comment';
import { client } from '../utils/fetchClient';
import { CommentsList } from './CommentsList';

interface Props {
  post: Post | null;
}

interface TitleProps {
  length: number | null;
  loading: boolean;
}

const Title: React.FC<TitleProps> = ({ length }) => {
  return length ? (
    <p className="title is-4">Comments:</p>
  ) : (
    <p className="title is-4" data-cy="NoCommentsMessage">
      No comments yet
    </p>
  );
};

export const PostDetails: React.FC<Props> = ({ post }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [writeCommentStatus, setWriteCommentStatus] = useState(false);

  const getComments = (postId: number) => {
    return client.get(`/comments?postId=${postId}`);
  };

  const deleteComment = (commentId: number) => {
    return client.delete(`/comments/${commentId}`);
  };

  const handleCommentDelete = (commentId: number) => {
    setLoading(true);
    setError(false);

    return deleteComment(commentId)
      .then(res => {
        if (res) {
          setComments(cur => cur?.filter(comment => comment.id !== commentId));
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!post) {
      return setComments([]);
    }

    setLoading(true);

    getComments(post.id)
      .then(res => setComments((res as Comment[]) || null))
      .catch(() => {
        setError(true);
        setComments([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [post]);

  return (
    <div className="content" data-cy="PostDetails">
      <div className="content" data-cy="PostDetails">
        <div className="block">
          <h2 data-cy="PostTitle">{post?.title}</h2>

          <p data-cy="PostBody">{post?.body}</p>
        </div>

        <div className="block">
          {loading && !error ? <Loader /> : ''}

          {error && (
            <div className="notification is-danger" data-cy="CommentsError">
              Something went wrong
            </div>
          )}

          {!loading && !error ? (
            <React.Fragment>
              <Title loading length={comments.length} />
              <CommentsList
                comments={comments}
                onDelete={handleCommentDelete}
              />
              <button
                data-cy="WriteCommentButton"
                type="button"
                className="button is-link"
                onClick={() => setWriteCommentStatus(true)}
              >
                Write a comment
              </button>
            </React.Fragment>
          ) : (
            ''
          )}
        </div>

        {writeCommentStatus && !error ? (
          <NewCommentForm
            postId={post?.id || null}
            onCommentAdd={setComments}
            onError={setError}
          />
        ) : (
          ''
        )}
      </div>
    </div>
  );
};
