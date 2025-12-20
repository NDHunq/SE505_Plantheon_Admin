import { Link, useSearchParams } from '@umijs/max';
import { Button, Result } from 'antd';
import React from 'react';
import useStyles from './style.style';

const RegisterResult: React.FC<Record<string, unknown>> = () => {
  const { styles } = useStyles();
  const [params] = useSearchParams();

  const actions = (
    <div className={styles.actions}>
      <a href="">
        <Button size="large" type="primary">
          <span>Kiểm tra email</span>
        </Button>
      </a>
      <Link to="/">
        <Button size="large">Trở về trang chủ</Button>
      </Link>
    </div>
  );

  const email = params?.get('account') || 'AntDesign@example.com';
  return (
    <Result
      className={styles.registerResult}
      status="success"
      title={
        <div className={styles.title}>
          <span>Tài khoản của bạn: {email} đăng ký thành công</span>
        </div>
      }
      subTitle="Email kích hoạt đã được gửi đến hòm thư của bạn, email có hiệu lực trong 24 giờ. Vui lòng đăng nhập email và nhấp vào liên kết để kích hoạt tài khoản."
      extra={actions}
    />
  );
};
export default RegisterResult;
