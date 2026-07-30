import React from 'react';
import Filter from './Filter';
import ButtonWrapper from './ButtonWrapper';

export default function Footer(props) {
    const {completedCount, totalCount, filter, changeFilter} = props;
    const percent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
    return (
        <footer className="clearfix">
            <div className="pull-left buttons">
                <ButtonWrapper {...props}/>
            </div>
            <div className="pull-left" style={{marginLeft: '10px'}}>
                {`已完成 ${completedCount} / 总数 ${totalCount}`}
            </div>
            <div className="pull-left" style={{marginLeft: '10px', width: '200px'}}>
                <div className="progress" style={{marginBottom: '0'}}>
                    <div className="progress-bar progress-bar-success" role="progressbar"
                        aria-valuenow={percent} aria-valuemin="0" aria-valuemax="100"
                        style={{width: `${percent}%`}}>
                    </div>
                </div>
            </div>
            <div className="pull-right">
                <Filter {...{filter, changeFilter}}/>
            </div>
        </footer>
    );
}
